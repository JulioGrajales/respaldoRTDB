const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadsSchema = new Schema({
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
});

module.exports = mongoose.model('leads', LeadsSchema);