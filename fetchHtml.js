let Rx = require('rx');
let iconv = require('iconv-lite');
let rxRequest = require('./rxRequest.js');
let cheerio = require('cheerio');
let _ = require('lodash');

let loadHtml = _.curryRight(cheerio.load)({ decodeEntities: false });

let fetchHtml = _.curry(function(timeout, isGbk, url) {
  let source = rxRequest({ url, timeout, encoding: null })
    .retry(3)
    .map(function(body) {
      if (isGbk) {
        body = iconv.decode(body, 'gbk');
      }

      return {
        url,
        $: loadHtml( body.toString() )
      };
    });

  return source;
});

let replaceKeyword = function(urlTpl, keyword) {
  return urlTpl.replace('{keyword}', encodeURIComponent(keyword));
};

let replacePageIndex = function(urlTpl, pageIndex) {
  return urlTpl.replace('{pageIndex}', pageIndex);
};

let main = function(options) {
  let {
    urlTpl,
    keywords,
    handleContent,
    isGbk = false,
    pageSize = 5,
    timeout = 3000,
  } = options;

  let fetch = fetchHtml(timeout, isGbk);

  let srcs = _.chain(keywords)
    .map(function(keyword) {
      return replaceKeyword(urlTpl, keyword);
    })
    .flatMap(function(urlTpl) {
      return _.range(pageSize).map(pageIndex => replacePageIndex(urlTpl, pageIndex));
    })
    .map(fetch)
    .value();

  let ret = Rx.Observable.merge(...srcs)
    .map(handleContent)
    .reduce(function(preVal, curItem) {
      return preVal.concat(curItem);
    }, []);

  return ret;
};




module.exports = main;
