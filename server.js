'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { DATABASE_URL, PORT } = require('./config');
const { Place } = require('./models/place');
const { UserComment } = require('./models/userComment');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// connecting to mongoDb
mongoose.connect(
  'mongodb://coreyjhighland:Here2lars@ds161008.mlab.com:61008/top-locations',
  { useNewUrlParser: true }
);
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
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseURL,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
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
  runServer(DATABASE_URL).catch(err => console.log(err));
}

app.listen(process.env.PORT || 5005);

module.exports = { runServer, app, closeServer, UserComment };
