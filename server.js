
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const leadsModel = require('./models/amenities');

const {agregarData,acomodarData} = require('./getData');

const app = express();


app.set('port', 8090);

app.use(express.static(path.join(__dirname, 'public')));



const server = http.createServer(app);
const io = socketio(server);



run().catch(error => console.error(error));

server.listen(app.get('port'), () => console.log(`Server now running on port ${app.get('port')}!`));


async function run() {


  await mongoose.connect('mongodb://mongo1-rtdb:27017,mongo2-rtdb:27017,mongo3-rtdb:27017/capital28_dev', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // PRUEBAS


  // agregarData(leadsModel).then(arrData => {
    

  //   const miData = acomodarData(arrData);
  //   console.log('IMPRIMIENDO DATA');
  //   console.log(miData);
  // });


  io.on('connection',socket => {
    agregarData(leadsModel).then(arrData => {
      const miData = acomodarData(arrData);
      socket.emit('cargar amenidades', miData);
    });

    leadsModel.watch().
      on('change', change => {
        agregarData(leadsModel).then(arrData => {
          const miData = acomodarData(arrData);
          socket.emit('cargar amenidades', miData);
        });
      });

  });


  // io.on('connection', async socket => {
  //   let amenidades = await amenities.find();
  //   socket.emit('cargar amenidades', amenidades);

  //   amenities.watch().
  //     on('change', async change => {
  //       //console.log("SUCEDIO ALGO EN LA DB ", data)
  //       let amenidades;
  //       switch (change.operationType) {
  //         case "insert":
  //           amenidades = await amenities.find();
  //           socket.emit('cargar amenidades', amenidades);
  //           break;
  //         case "delete":
  //           amenidades = await amenities.find();
  //           socket.emit('cargar amenidades', amenidades);
  //           break;
  //       }
  //     });

  // });




  /*
  const lead = mongoose.model('leads', new mongoose.Schema(
    {
      contact_lead_id: mongoose.Schema.ObjectId,
      // nombre del lead
      // debe coincidir con contact_lead.name
      contact_lead_name: String,
      contact_broker_id: mongoose.Schema.ObjectId,
      // por implementar log con los asignamientos de brokers
      assignments: [
        {
          contact_broker_id: mongoose.Schema.ObjectId,
          assigned_at: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      // perfil
      profile: {
        type: String,
        enum: ['', 'A', 'B', 'C', 'D'],
        default: '',
      },
      // presupuesto
      budget: Number,
      currency: String,
      // metodo de pago
      payment_method: String,
      target_action: String,
      property_type: [],
      interested_in: String,
      zones: String,
      // fase general
      phase: {
        type: String,
        enum: ['active', 'discarded', 'in-operation', 'finished'],
        default: 'active',
      },
      // fases mientras se encuentra activo el lead
      tracking_phase: {
        type: String,
        // Por asignar - Asignado - Por contactar - Búsqueda - Seguimiento - Recorrido agendado - Recorrido realizado- Ofertando - Fecha de Apartado
        // ver documentación https://wayaweb.atlassian.net/wiki/spaces/C2/pages/393225/Kanban+Leads+Rules
        // unassigned - llega nuevo lead sin asignacion de broker
        // assigned - el lead se ha asignado a un broker (puede ingresar el lead con broker asignado si el admin así lo define)
        // to-contact - el broker no ha abierto el lead
        // searching - búsqueda de opciones
        enum: [
          'unassigned',
          'assigned',
          'to-contact',
          'searching',
          'tracking',
          'scheduled-tour',
          'finished-tour',
          'offer',
          'downpayment',
          '',
        ],
        default: 'unassigned',
      },
      // fase de operacion
      operation_phase: {
        type: String,
        enum: ['contract', 'closing-trade', ''],
        default: '',
      },
      reassigned: {
        type: String,
        enum: ['none', 'done'],
        default: 'none',
      },
      // posponer lead para darle seguimiento despues
      postponed: {
        is_postponed: {
          type: Boolean,
          default: true,
        },
        date_at: {
          type: Date,
          default: Date.now,
        },
      },
      // inidica si el broker o admin ha entrado a revisar el lead
      reviewed: {
        is_reviewed: {
          type: Boolean,
          default: false,
        },
        date_at: {
          type: Date,
          default: Date.now,
        },
      },
      contact: {
        // quien se encuentra buscando
        target_client: String,
        // metodo como nos encontro
        how_did_contact_us: String,
        // metodo por el que prefiere ser contactado
        contact_method: String,
        // alguien mas ayuda a buscar
        search_partner: String,
        // plazo estimado para tomar decision
        estimated_time: Date,
        // tiempo buscando
        searching_time: {
          type: Date,
          default: Date.now,
        },
        // disponibilidad para un tour
        availability_tour: String,
        // idioma
        language: String,
      },
      // link crm externo como easybroker
      crm_link: String,
      // observaciones generales
      observations: String,
      // notas con motivo de descarte
      discard_observations: String,
      // porcentaje perfilapp
      profile_percentage: {
        type: Number,
        default: 0.0,
      },
      // lista de comentarios realizados por admin, brokers, developers
      comments: [],
      // registros realizados, por rediseñar este módulo
      register_leads: [],
      // datos de distintos tios
      miscellaneous: {
        mkt: String,
        marketing: {
          campaign: String,
          adSet: String,
          ad: String,
          form: String,
          cost: Number,
          sales: Number,
          revenue: Number,
          utm_term: String,
          utm_content: String,
          campaign_id: String,
        },
      },
      real_estate_group_id: {
        type: mongoose.Schema.ObjectId,
      },
      // por el momento no se usa para filtrar activos
      status: { type: Number, default: 1 },
      created_at: {
        type: Date,
        default: Date.now,
      },
      updated_at: {
        type: Date,
        default: Date.now,
      }
    }));

  lead.watch().
    on('change', data => console.log("SUCEDIO ALGO EN LA DB ", data));

  console.log('Insertando documento');
  await lead.create(
    {
      "postponed": {
        "is_postponed": true,
        "date_at": new Date("2021-06-02T15:20:20.017Z")
      },
      "reviewed": {
        "is_reviewed": false,
        "date_at": new Date("2021-06-02T15:20:20.010Z")
      },
      "miscellaneous": {
        "marketing": {
          "campaign": "Inmubles24"
        }
      },
      "profile": "",
      "property_type": [
        "Departamentos"
      ],
      "phase": "active",
      "tracking_phase": "unassigned",
      "operation_phase": "",
      "reassigned": "none",
      "profile_percentage": 0,
      "comments": [],
      "register_leads": [],
      "status": 1,
      "contact": {
        "how_did_contact_us": "SUPER INMUEBLES",
        "searching_time": new Date("2021-06-02T15:20:20.017Z")
      },
      "contact_lead_name": "JULIO ANDRES",
      "zones": "The Boat",
      "observations": "Av. CTM Mzn 164 lote 001 http://link.navent.com/ls/click?upn=40t5xIsGLDXfG4Ufy4QB0cB6aJZdZI2IddJO0xnVxmwsyY-2BBSi1iY9caKzgiGdXb-2FO6zmFvdE5P7OOFMZfQdMaoRu-2BH4M-2F0yun2Dz3hjmopnwgEsOTfDdrcOzsqTC2l-2FQCigE8zzwDN1cGzdEB3nuR1HlGKdOwKVEUs-2FvnoSrKoyR5XEOP1-2B5AdlelrSFDSzxNe3fTxPZld6SKHZtvi41uJxDTWxmUQIKt1TcD8GBs4lLVcBVi-2FT-2BxlZE-2Fk41Nu4po5I_dtdrDEtL8JGd6oj5HXMDEUDNXB7Tbh-2Fa6-2BFQrbaU2ZkWCRKNmX9x693XYA-2Bo-2FHH6TsPYUSD3WQd4sLP6w415HwoagtCZh8752LR-2FevuOGKyRAY0HeZqAu-2F5QYgjiSAw4J3y7DukPcoI2zUEEbHKs8f21UJxc4tuup34Nhk6vHN4HNqagwbRwLFhoK3YnGot6PFJhKN32SmBDLZXMvHICqroCuN-2Fb6cqVjG0HDWvnSdAGJr69ZKvUKCZYC2gAk3cJEevXnQI3TwWNNbodPVin006wvMGp-2BCVXFtWomYti1bp2OBadtaouSac3gNWkaakSp4TA1Na7QziSe0f5wQ45XnpDCJ5gFLAAb-2FL1B5Y-2BUWrI4vdjdDDXpnilSPix8S7PXeIDOXKdDu4FVBNXY6e4liUUvgV0o9-2BmmPrCcam6Ce0-3D \n",
      "created_at": new Date("2021-06-02T15:20:20.010Z"),
      "updated_at": new Date("2021-06-02T15:20:20.010Z"),
      "contact_lead_id": mongoose.Types.ObjectId("60b7a1b3ddc51300543c9d31"),
      "real_estate_group_id": mongoose.Types.ObjectId("5e9a2df024535649bdc51f54"),
      "assignments": [],
      "__v": 0
    }
  );
  console.log('doc insertado');
*/
}