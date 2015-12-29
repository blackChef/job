var fetchContent = require('./fetch.js');
var _ = require('lodash');
var urlTool = require('url');

module.exports = function(callback) {
  var options = {
    pageTpl: `http://m.51job.com/search/joblist.php?jobarea=150200&keyword=html5&pageno={page}`,
    pageSize: 1,
    handleContent: function($) {
      var list = $('.jblist > a');
      return _.map(list, function(item) {
        return {
          companyName: $(item).find('aside').text(),
          salary: $(item).find('em').text(),
          link: urlTool.resolve(options.pageTpl, $(item).attr('href')),
          src: '51job'
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