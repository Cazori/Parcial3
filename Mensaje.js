const socketIOClient = require('socket.io-client');
const readline = require('readline');
const MongoClient = require('mongodb').MongoClient;

const mongoURL = 'mongodb://localhost:27017/';
const dbName = 'nombre_de_DB_generico';
const collectionName = 'nombre_de_coleccion';

const socket = socketIOClient('http://localhost:8000');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error al conectar:', err);
    return;
  }

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  socket.on('connect', () => {
    rl.question('Ingrese su ID: ', (id) => {
      rl.question('Ingrese su nombre: ', (name) => {
        rl.question('Ingrese un mensaje: ', (message) => {
          const mensaje = {
            id,
            name,
            message
          };

          collection.insertOne(mensaje, (err) => {
            if (err) {
              console.error('Error al guardar el mensaje en la base de datos:', err);
              return;
            }
            socket.emit('send_message', mensaje);
            socket.disconnect();
            rl.close();
          });
        });
      });
    });
  });

  socket.on('new_message', (mensaje) => {
    console.log(' Mensaje recibido:', mensaje);
  });

  socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
  });
});
