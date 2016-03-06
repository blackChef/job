var Rx = require('rx');
var iconv = require('iconv-lite');
var rxRequest = require('./rxRequest.js');
var cheerio = require('cheerio');
var _ = require('lodash');

function fetchContent(options) {
  var source = Rx.Observable
    .range(1, options.pageSize || 5)
    .flatMap(function(pageCount) {
      return rxRequest({
        url: options.urlTpl.replace('{page}', pageCount),
        timeout: options.timeout || 10000,
        encoding: null,
      });
    })
    .retry(3)
    .map(function(res) {
      var body = res.body;

      var html;
      if (options.gbk) {
        html = iconv.decode(body, 'gbk').toString();
      } else {
        html = body.toString();
      }

      return {
        url: res.url,
        $: cheerio.load(html, {
          decodeEntities: false
        })
      };
    });

  return source;
}

// options = {
//   urlTpl: 'keyword={keyword}&pageno={pageno}',
//   handleContent: function() {}
//   src: [
//     {
//       keyword: 'html5',
//       pageSize: 5,
//       gbk: false,
//       timeout: 5000
//     },
//   ]
// }
module.exports = function(options) {
  var urlTpl = options.urlTpl;
  var src = options.src;
  var handleContent = options.handleContent;

  var _src = _.chain(src)
    .map(function(item) {
      return _.assign({}, item, {
        urlTpl: urlTpl.replace('{keyword}', item.keyword)
      });
    })
    .map(function(options) {
      return fetchContent(options);
    })
    .value();

  var ret = Rx.Observable.merge.apply(null, _src)
    .map(function(res) {
      return handleContent(res);
    })
    .reduce(function(preVal, curItem) {
      return preVal.concat(curItem);
    }, []);

  return ret;
};
