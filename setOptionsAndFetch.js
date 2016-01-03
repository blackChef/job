var _ = require('lodash');
var fetchContent = require('./fetchHtml.js');

module.exports = function(defaultOptions, src) {
  var _src;

  // [{
  //   keyword: 'html5',
  //   pageSize: 3,
  // }, {
  //   keyword: 'java',
  //   pageSize: 5,
  // }];
  if ( src.length == 1 && Array.isArray(src[0]) ) {
    _src = src[0]
      .map(function(item) {
        return Object.assign({}, item, {
          keyword: encodeURIComponent(item.keyword)
        });
      })
      .map(function(item) {
        return Object.assign({}, defaultOptions.srcConfig, item);
      });

  // html5, javascript...
  } else {
    _src = _.map(src, function(item) {
      return Object.assign({}, defaultOptions.srcConfig, {
        keyword: encodeURIComponent(item)
      });
    });
  }

  var options = Object.assign({}, defaultOptions, {
    src: _src
  });

  return fetchContent(options);
};


