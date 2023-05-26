const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const mongoURL = 'mongodb://localhost:27017/';
const dbName = 'database_name';
const collectionName = 'collection_name';

MongoClient.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error al conectar a MongoDB:', err);
    return;
  }

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      console.log('Cliente desconectao:', socket.id);
    });

    socket.on('send_message', (data) => {
      collection.insertOne(data, (err) => {
        if (err) {
          console.error('Error al guardar el mensaje en la base de datos:', err);
          return;
        }
        socket.broadcast.emit('new_message', data);
      });
    });
  });
});

const port = 8000;
server.listen(port, () => {
  console.log(`Servidor SocketIO iniciado en el puerto ${port}`);
});
