'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { DATABASE_URL, PORT } = require('./config');
const { Place } = require('./models/place');
const { UserComment } = require('./models/userComment');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const app = express();
app.use(express.json());
app.use(express.static('public'));

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

// connecting to mongoDb
mongoose.connect(DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;

db.once('open', function() {
  console.log('Connected to database');
}).on('error', function(error) {
  console.log('Connection error:', error);
});

// GET all locations
app.get('/locations', (req, res) => {
  return Place.find()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

// GET all comments
app.get('/locations/comment', (req, res) => {
  return UserComment.find()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

// GET comment by id
app.get('/locations/comment/:id', (req, res) => {
  return UserComment.findById(req.params.id)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

// POST comment
app.post('/locations/comment', (req, res) => {
  const requiredFields = ['userName', 'comment', '_place'];
  for (let i = 0; i < requiredFields; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.log(message);
      return res.status(400).send(message);
    }
  }
  let myUserComment = new UserComment(req.body);
  myUserComment
    .save()
    .then(UserComment => {
      res.send({ UserComment });
    })
    .catch(err => {
      res.status(400).send('unable to save to database');
    });
});

// PUT -Update chosen fields of comment
app.put('/locations/comment/:id', (req, res) => {
  let updated = {};
  let updateableFields = ['userName', 'comment'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  UserComment.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(() => {
      res
        .status(204)
        .json({ message: `updated item with id ${req.params.id}` })
        .end();
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

// DELETE comment by id
app.delete('/locations/comment/:id', (req, res) => {
  return UserComment.findByIdAndRemove(req.params.id)
    .then(() => {
      res
        .status(204)
        .json({ message: `deleted item with id ${req.params.id}` })
        .end();
    })
    .catch(err => res.status(500).json({ error: 'something went wrong' }));
});

// open and close the server
let server;

function runServer(databaseURL, port = PORT) {
  server = app.listen(port, () => {
    console.log('app listening on port ', port);
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL);
}

app.listen(process.env.PORT || 5005);

module.exports = { runServer, app, closeServer, UserComment };
