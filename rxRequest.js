let request = require('request');
let Rx = require('rx');

module.exports = Rx.Observable.fromNodeCallback(function(options, callback) {
  request(options, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      callback(null, body);
    } else {
      callback(err);
    }
  });
});