var _ = require('lodash');
var urlTool = require('url');
var cheerio = require('cheerio');
var fetchContent = require('../setOptionsAndFetch.js');

var defaultOptions = {};

defaultOptions.srcConfig = {
  gbk: false,
  timeout: 5000,
  pageSize: 5
};

defaultOptions.urlTpl =
  `http://m.zhaopin.com/anhui-hefei-664/?keyword={keyword}&pageindex={page}`;

defaultOptions.handleContent = function (res) {
  var url = res.url;
  var $ = res.$;

  var list = $('.r_searchlist .listbox a');
  return _.map(list, function(item) {
    return {
      companyName: $(item).find('.companyname').text(),
      salary: $(item).find('.salary').text(),
      link: urlTool.resolve(url, $(item).attr('href')),
      src: '智联招聘',
      title: $(item).find('.jobname').text()
    };
  });
};



module.exports = function() {
  return fetchContent(defaultOptions, arguments);
};
