'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL;
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'mongodb://admin:Password1@ds161008.mlab.com:55794/top-locations-test';
exports.PORT = process.env.PORT || 5000;
