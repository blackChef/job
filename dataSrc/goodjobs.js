var _ = require('lodash');
var urlTool = require('url');
var fetchHtml = require('../fetchHtml.js');
var iconv = require('iconv-lite');


module.exports = function() {
  var options = {};

  options.urlTpl = `http://m.goodjobs.cn/list.php?` +
    `boxwpve=1043&` +
    `salary=313,3189,3190&` +
    `keyword={keyword}&` +
    `page={page}`;

  options.src = _.map(arguments, function(item) {
    return {
      keyword: encodeURIComponent(item),
    };
  });

  options.handleContent = function (res) {
    var url = res.url;
    var $ = res.$;

    var list = $('.jobview_lists_b a');

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


  return fetchHtml(options);
};
