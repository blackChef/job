var _ = require('lodash');
var urlTool = require('url');
var cheerio = require('cheerio');
var fetchContent = require('../setOptionsAndFetch.js');

var defaultOptions = {};

defaultOptions.srcConfig = {
  gbk: false,
  pageSize: 5
};

defaultOptions.urlTpl = `http://m.51job.com/search/joblist.php?` +
  `jobarea=150200&` +
  `keyword={keyword}&pageno={page}`;

defaultOptions.handleContent = function (res) {
  var url = res.url;
  var $ = res.$;

  var list = $('.jblist > a');
  return _.map(list, function(item) {
    return {
      companyName: $(item).find('aside').text(),
      salary: $(item).find('em').text(),
      link: urlTool.resolve(url, $(item).attr('href')),
      src: '51job',
      title: $(item).find('h3').text()
    };
  });
};



module.exports = function() {
  return fetchContent(defaultOptions, arguments);
};
