var _ = require('lodash');
var urlTool = require('url');
var cheerio = require('cheerio');
var fetchContent = require('../setOptionsAndFetch.js');

var defaultOptions = {};

defaultOptions.srcConfig = {
  gbk: true,
  pageSize: 5
};

defaultOptions.urlTpl = `http://m.goodjobs.cn/list.php?keyword={keyword}&page={page}`;

defaultOptions.handleContent = function (res) {
  var url = res.url;
  var $ = res.$;

  var list = $('.jobview_lists a');
  return _.map(list, function(item) {
    return {
      companyName: $(item).find('.corp_name').text(),
      salary: $(item).find('.apply_name i').text(),
      link: urlTool.resolve(url, $(item).attr('href')),
      src: '新安人才网',
      title: $(item).find('.job_name').text()
    };
  });
};



module.exports = function() {
  return fetchContent(defaultOptions, arguments);
};
