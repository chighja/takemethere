'use strict';

const mongoose = require('mongoose');

const userCommentSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
    comment: { type: String, required: true },
    created: { type: Date, default: Date.now },
    _place: { type: String }
  },
  { collection: 'commentData' }
);

const UserComment = mongoose.model('userComment', userCommentSchema);
module.exports = { UserComment };
