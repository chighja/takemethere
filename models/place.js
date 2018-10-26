'use strict';

const mongoose = require('mongoose');

const placeSchema = mongoose.Schema(
  {
    id: String,
    name: String,
    picture: String,
    _comments: []
  },
  { collection: 'travelData' }
);

const Place = mongoose.model('place', placeSchema);
module.exports = { Place };
