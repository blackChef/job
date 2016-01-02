var request = require('request');
var cheerio = require('cheerio');
var Rx = require('rx');
var iconv = require('iconv-lite');

var rxRequest = Rx.Observable.fromCallback(function(options, callback) {
  // console.log(`start fetching: ${options.url}`);
  request(options, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }

    if (options.gbk) {
      body = iconv.decode(body, 'gbk');
    }

    callback(body.toString());
  });
});

function fetchContent(options) {
  var source = Rx.Observable.range(1, options.pageSize || 5).flatMap(function(pageCount) {
    return rxRequest({
      url: options.pageTpl.replace('{page}', pageCount),
      timeout: 5000,
      encoding: null,
      gbk: options.gbk,
    }).retry(3);
  })
  .map(function(res) {
    var $ = cheerio.load(res, { decodeEntities: false });
    return options.handleContent($);
  });

  var result = [];
  var subscription = source.subscribe(
    function(next) {
      next.forEach(function(item) {
        result.push(item);
      });
    },

    function(err) {
      if (err) {
        options.error(err);
      }
    },

    function() {
      options.complete(result);
    }
  );
}

module.exports = fetchContent;