var _ = require('lodash');
var urlTool = require('url');
var fetchHtml = require('../fetchHtml.js');



module.exports = function() {
  var options = {};

  options.src = _.map(arguments, function(item) {
    return {
      keyword: encodeURIComponent(item),
      gbk: false
    }
  });

  options.urlTpl = `http://m.51job.com/search/joblist.php?` +
    `jobarea=150200&` +
    `keyword={keyword}&keywordtype=0&pageno={page}`;

  options.handleContent = function (res) {
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

  return fetchHtml(options);
};
