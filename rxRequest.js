var request = require('request');
var Rx = require('rx');

module.exports = Rx.Observable.fromNodeCallback(function(options, callback) {
  // console.log(`requesting: ${options.url}`);

  request(options, function(err, res, body) {
    // console.log(`finish requesting: ${options.url}`);
    if (!err && res.statusCode == 200) {
      callback(null, { url: options.url, body: body });
    } else {
      console.log(`fetching failed ${options.url}`);
      console.log(err);
      callback(err);
    }
  });
});