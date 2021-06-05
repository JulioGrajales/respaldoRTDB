
# Realtime DB Project

El objetivo del proyecto es implementar lo necesario de forma que podamos tener una base de datos en tiempo real, similar a lo que tiene Firebase de forma nativa. 

Es decir, que los datos de la aplicación cambien en tiempo real sin necesidad de tener que recargar como actualmente debe hacerse.


Para este proyecto se tiene que estudiar mongodb y express junto Socket IO de igual manera pueden echarle un ojo a Feathers.js aunque no creo que sea muy necesario.

En sí lo que queremos es una funcionalidad que esté escuchando los cambios que se realicen en la db y este lo regrese. Inicialmente lo implementarán con los Prospectos (Leads) para que más adelante podamos monitorear los demás datos.

## Estructura de un Lead
```
{
    "_id" : ObjectId("608ca3cda4a4b20011ab4339"),
    "postponed" : {
        "is_postponed" : false,
        "date_at" : null
    },
    "reviewed" : {
        "is_reviewed" : null,
        "date_at" : ISODate("2021-05-01T11:01:59.316Z")
    },
    "miscellaneous" : {
        "marketing" : {
            "campaign" : "COLD_L_Inzignia",
            "adSet" : "FIT & Stock Trader - 470k + DTE  - Top 4",
            "ad" : "2:7 - Copy",
            "form" : "Inzignia - Alom x Momnt"
        }
    },
    "profile" : "",
    "property_type" : [ 
        "Departamento"
    ],
    "phase" : "discarded",
    "tracking_phase" : "",
    "operation_phase" : "",
    "profile_percentage" : 20,
    "comments" : [ 
        {
            "text" : "Es Broker mandar información y programar visita a la oficina",
            "created_at" : ISODate("2021-05-03T17:15:28.531Z"),
            "comment_id" : ObjectId("60902fb0a4a4b20011ab4b2e"),
            "image_src" : "",
            "audio_src" : "",
            "contact_broker_id" : ObjectId("5e7286cb7f0c7d004ff828ab")
        }
    ],
    "register_leads" : [],
    "status" : 1,
    "contact" : {
        "how_did_contact_us" : "Facebook",
        "searching_time" : ISODate("2021-05-01T00:41:49.757Z")
    },
    "contact_lead_name" : "Enrique Melis",
    "zones" : "Inzignia",
    "observations" : "$2,000,000 a $6,000,000",
    "created_at" : ISODate("2021-05-01T00:41:49.755Z"),
    "updated_at" : ISODate("2021-05-03T17:15:36.305Z"),
    "contact_lead_id" : ObjectId("608ca3cda4a4b20011ab4338"),
    "real_estate_group_id" : ObjectId("5e7275f21bacbea8c964f6bc"),
    "assignments" : [],
    "__v" : 0,
    "contact_broker_id" : ObjectId("5e7286cb7f0c7d004ff828ab")
}
```

Les explicaré los datos más importantes y con los que trabajaran más, ya que los demás se dan por entender por si solos, ejemplo:

| contact_lead_name | nombre del prospecto |

| budget y currency | precio y tipo de moneda |

| postponed | este parámetro indica cuando un lead se pospuso |

| reviewed | indica cuando el contacto al que se asignó lo revisa por primera vez aquí calculamos la inmediatez del vendedor |

| phase, operation_phase y tracking_phase | controlan los estados de las fases |

| phase | active, in-operation, discarded y finished |

> tracking_phase :

   1. unassigned - Por asignar

   2. assigned - Asignado

   3. to-contact - Por contactar

   4. searching - Búsqueda

   5. tracking - Seguimiento

   6. scheduled-tour - Recorrido agendado

   7. finished-tour - Recorrido finalizado

   8. offer - Ofertando

   9. downpayment - Fecha de apartado

> operation_phase:

   1. contract - Contratos

   2. closing-trade - Fecha de cierre

> Las fases trabajan de la siguiente manera:

**Prospecto:**

**phase:** active, tracking_phase: la fase del 1 al 9 en ingles. operation_phase: "" (un string vacio) 

**Compra,contrato,acuerdo:**

**phase:** in-operation, tracking_phase: "" (string vacio) operation_phase: la fase seleccion del 1 al 2 

**Cerrar prospecto con compra, contrato, etc.:**

**phase:** finished, tracking_phase: "" (string vacio), operation_phase: "" (string vacio)

**contact:** de donde nos está contactando el prospecto, usamos algunas plataformas para sincronizar información que entren por Facebook, Instagram algunas plataformas como Inmubles24, vivanuncios, … Se guardan en el parámetro how_did_contact_us

**real_estate_group_id:** Inmobiliaria a la que pertenece.

**contact_broker_id:** Broker o Admin al que está asignado el prospecto.

**comments:** Aquí es donde se agregan los comentarios, igual se pueden agregar imágenes o audio.

Estos son los parámetros con los que va a estar trabajando.

## Modelo del Lead
Así está estructurado el modelo (Lo van a utilizar):
```
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Modelo para almacenar los leads generados en el  sistema
const leadSchema = new Schema({
  _id: mongoose.Schema.ObjectId,
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
  },
});

module.exports = mongoose.model('leads', leadSchema);
```
## Socket
Y en si la idea es la siguiente: 
```
const socket_io = require('socket.io');
var io = socket_io();
const User = require('../models/User');

const changeStream = User.watch();

changeStream.on('change', (change) => {
    console.log(change);
	// Convertir la información para que sea legible, para cuando se aplique en el front
    io.emit('changeData', change);
}); 

io.on('connection', function () {
    console.log('connected');
});

var socket = io;
module.exports = socket;
```
## End-Point a simular
En esta parte les pondremos algunos end-point para que revisen y puedan estructurar la información como queremos que lo traigan, ya que se utilizarán en web y móviles:


### Stats

https://dev.api.capital28.investments/api/lead/stats

Descripción:

Esta API muestra la cantidad de lead que se encuentran en una fase o bien en algún “estado”, por ejemplo:

Una fase puede ser una de las que se mencionó anteriormente:

| Fase | Descripción |
| ------ | ------ |
| unassigned | Por asignar |
| assigned | Asignado |
| to-contact | Por contactar |
| searching | Busqueda |
| tracking | Seguimiento |
| scheduled-tour | Recorrido agendado |
| finished-tour | Recorrido Finalizado |
| offer | Ofertando |
| downpayment | Fecha de Apartado |

Un “estado” tiene que ver con las acciones que no se le han hecho o se le han hecho a un lead, cómo no no darle seguimiento, no haberle comentado, etc etc, el único ejemplo para este es una que se llama “Sin seguimiento” ese dato también viene en esta api.


**Esta api, también funciona filtrando los leads por usuario, por ejemplo:**
Si le paso un token que es de un broker, me traerá la cantidad de leads que tiene dicho broker, supongamos que maría y juan hacen una consulta y esa api trae los leads por cada fase.

En caso de ser un admin, él puede ver todos los leads, tanto como los de él, los de maría y los de juan, siempre y cuando pertenezcan al mismo grupo.

**Un ejemplo de cómo se usa en la app:**


Entonces, para que un broker/Admin se entere que hay un cambio en esos kpis, actualmente tiene que refrescar la vista, y el objetivo es que cada que un lead cambie de fase, esos numeros se cambien por si solo.


Les paso nuevamente un token para que puedan consultar:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZGIzMTFiOTVkNzM1NzA0NjYyNzRhYTYiLCJuYW1lIjoiVGVzdCBBZG1pbiIsImNvbnRhY3RfaWQiOiI1ZGIzMTFkZDBhMjNmMTJhNGYwNjk2YjMiLCJvcmlnaW4iOiIiLCJyb2xlIjoiYWRtaW4iLCJhY2Nlc3NfZ3JvdXAiOiI1ZTlhMmRmMDI0NTM1NjQ5YmRjNTFmNTQiLCJpYXQiOjE1OTkwNjg1NDR9.tSsp6BT2hWyd-bwGiRR29cLJGJHrSzVHGsrFFnkoSAE
```

### Last comments


https://dev.api.capital28.investments/api/manifest/getLastCommentsLeads


Esta api es para obtener los comentarios recientes, aunque esta api mayormente va dirigida a los administradores o desarrolladores, de esta manera pueden ver cada comentario que sus brokers están realizando, recuerden que nustros usuarios se dividen por grupo inmobiliario, ejemplo:


Invertikal (es un grupo inmobiliario) tiene a sus asesores de venta, entre ellos puede haber un desarrollador, broker y un administrador, 

Inversiones caviza  (es un grupo inmobiliario) tiene a sus asesores de venta, entre ellos puede haber un desarrollador, broker y un administrador, 

Invertikal no puede ver los numero ni comentarios que hace los brokers de inversiones caviza.

## Development Environment with Docker

### docker-compose

Para ejecutar el stack de servicios (mongo, mongo-express, nodejs, etc.) tenemos que hacerlo vía docker-compose. Desde la raíz de nuestro proyecto (donde está situado el archivo docker-compose.yaml) ejecutamos:
Usamos la opción -d para ejecutar en modo desacoplado.

Levantar el stack:
```sh
docker-compose up -d
```

Dar de baja el stack:
```sh
docker-compose down
```

Es importante dar de baja el stack una vez que terminemos de trabajar para no utilizar recursos innecesariamente. Cuidemos el planeta!

### docker-ps y logs

Si queremos verificar los contenedores que docker está corriendo actualmente, ejecutamos:

```sh
docker ps
```

En caso de querer visualizar los logs de algún container ejecutamos:
Usamos la opción -f (follow) para obtener logs en tiempo real.

```sh
docker-logs -f container-id
```

### docker run

Cuando no tenemos un ambiente de nodejs prefabricado tal vez queramos ejecutar npm init para iniciar un archivo package.json, para esto necesitamos poder ejecutar comandos de npm y compartir nuestra carpeta actual de manera que todo lo que realicemos en el container quede registrado en nuestro directorio para esto tenemos que hacer un 'bind volumen' entre nuestro equipo y el container.

En Linux/Mac el comando para referenciar el directorio actual es $(PWD).
En Windows usaremos la variable de entorno %cd% para referenciar la ruta actual del directorio. 
Nuestros comandos quedarían de la siguiente forma:

Windows:
```sh
cd path/to/git/projects/current-project
docker run --rm -ti -v %cd%:/srv/app node:14-alpine3.13 sh
```

Linux/Mac:
```sh
cd path/to/git/projects/current-project
docker run --rm -ti -v $(PWD):/srv/app node:14-alpine3.13 sh
```

### docker exec

Para acceder a un contenedor corriendo no podemos ejecutar docker run ya que nuestro contenedor ya está corriendo, en su lugar lo hacemos vía docker exec mediante el siguiente comando:

```sh
docker exec -ti container-id sh
```

### mongo-express

Desde el navegador para entrar a mongo-express, escribimos:

```
localhost:8081
```

### Robo3T
Podemos usa [Robo3T](https://robomongo.org/) una GUI para visualizar los datos de nuestra DB y usar la línea de comando de Mongo.
Abajo encontraremos la configuración básica para conectarnos a la base de datos de MongoDB en ambiente de docker vía Robo3T.

Abrimos el apartado de conexiones, y damos click en Crear, y colocamos la configuración como se muestra abajo. 
> Importante: si llegamos a instalar mongo y node, hay que desinstalar mongo y de paso también node para que no interfiera en este nuevo esquema de docker; también es válido desactivarlos por completo

1. Pestaña de Connection:

![](./docs/connection.png)

2. Pestaña de Authentication:

![](./docs/authentication.png)

3. Damos click en 'Test' y deberemos ver en verde las pruebas:

![](./docs/success_test.png)

4. Ejemplo de como se visualiza a la hora de conectarse al mongo. En este caso vemos una base de datos llamada 'capital28_dev':

![](./docs/collection_tree.png)
