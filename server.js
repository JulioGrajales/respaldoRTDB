
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const morgan = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();


const leadsModel = require('./models/leads');
const { procesarData } = require('./controllers/getData');

const rutas = require('./routes/login');


app.set('port', process.env.SERVER_PORT);
app.set('json spaces', 2);

app.use(morgan('dev'));
app.use(cors({ origin: "*" }));

app.use(rutas);

const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: "*" }
});

io.use((socket, next) => {

  if (socket.handshake.query.apiName
    && socket.handshake.query.real_estate_group_id
    && socket.handshake.query.contact_broker_id) {
    next();
  } else {
    next(new Error('faltan parametros'));
  }
});

io.use((socket,next) => {
  if(socket.handshake.query.token){
    jwt.verify(socket.handshake.query.token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
      if (err) return next(new Error('error de autenticacion'));
      next();
    });
  }else{
    next(new Error('falta token'));
  }
});

run().catch(error => console.error(error));

server.listen(app.get('port'), () => console.log(`Server now running on port ${app.get('port')}!`));


async function run() {

  await mongoose.connect('mongodb://mongo1-rtdb:27017,mongo2-rtdb:27017,mongo3-rtdb:27017/capital28_dev', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  io.on('connection', async socket => {
    const {real_estate_group_id,contact_broker_id} = socket.handshake.query;
    const data = await procesarData(
      real_estate_group_id,contact_broker_id
    );
    socket.emit('info', data);

    leadsModel.watch().
      on('change',async change => {
        const data = await procesarData(
          real_estate_group_id,contact_broker_id
        );
        socket.emit('info', data);
      });
      
  });

}