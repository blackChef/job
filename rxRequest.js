let request = require('request');
let Rx = require('rx');


// module.exports = Rx.Observable.fromNodeCallback(request);

module.exports = Rx.Observable.fromNodeCallback(function(options, callback) {
  request(options, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (res.statusCode != 200) {
      callback({ msg: `failed with code ${res.statusCode}` });
      return;
    }

    callback(null, body);
  });
});