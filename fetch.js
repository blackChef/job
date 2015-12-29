var request = require('request');
var cheerio = require('cheerio');
var Rx = require('rx');
var _ = require('lodash');
var iconv = require('iconv-lite');

var rxRequest = Rx.Observable.fromCallback(function(options, callback) {
  request(options, function(err, res, body) {
    if (err) {
      callback(err);
      return;
    }


    if (options.json) {
      body = JSON.parse( body.toString() );
    } else {
      if (options.gbk) {
        body = iconv.decode(body, 'gbk');
      }
      body = body.toString();
    }

    callback(body);
  });
});

function fetchContent(options) {
  var source = Rx.Observable.range(1, options.pageSize || 5).flatMap(function(pageCount) {
    return rxRequest({
      url: options.pageTpl.replace('{page}', pageCount),
      timeout: 5000,
      encoding: null,
      gbk: options.gbk,
    });
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