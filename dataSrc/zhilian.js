var _ = require('lodash');
var urlTool = require('url');
var fetchHtml = require('../fetchHtml.js');


module.exports = function() {
  var options = {};

  options.src = _.map(arguments, function(item) {
    return {
      keyword: encodeURIComponent(item),
    };
  });

  options.urlTpl = `http://m.zhaopin.com/anhui-hefei-664/?` +
    `keyword={keyword}&` +
    `salary=1000115000&` +
    `pageindex={page}`;

  options.handleContent = function(res) {
    var url = res.url;
    var $ = res.$;

    var list = $('.job-list a');
    return _.map(list, function(item) {
      return {
        companyName: $(item).find('.comp-name').text(),
        salary: $(item).find('.job-sal').text(),
        link: urlTool.resolve(url, $(item).attr('href')),
        src: '智联招聘',
        title: $(item).find('.job-name').text()
      };
    });
  };

  return fetchHtml(options);
};
