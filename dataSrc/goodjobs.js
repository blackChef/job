var fetchContent = require('../fetch.js');
var _ = require('lodash');
var urlTool = require('url');

module.exports = function(callback) {
  var options = {
    pageTpl: `http://m.goodjobs.cn/list.php?keyword=%C7%B0%B6%CB&page={page}`,
    gbk: true,
    handleContent: function($) {
      var list = $('.jobview_lists a');
      return _.map(list, function(item) {
        return {
          companyName: $(item).find('.corp_name').text(),
          salary: $(item).find('.apply_name i').text(),
          link: urlTool.resolve(options.pageTpl, $(item).attr('href')),
          src: '新安人才网',
          title: $(item).find('.job_name').text()
        };
      });
    },
    complete: function(result) {
      callback(null, result);
    },

    error: function(err) {
      callback(err, null);
    }
  };
  fetchContent(options);
};
