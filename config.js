'use strict';

exports.DATABASE_URL =
  process.env.DATABASE_URL || 'mongodb://coreyjhighland:Here2lars@ds161008.mlab.com:61008/top-locations';
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'mongodb://coreyjhighland:Here2lars@ds161008.mlab.com:61008/top-locations';
exports.PORT = process.env.PORT || 5000;
