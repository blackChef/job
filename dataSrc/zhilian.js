var fetchContent = require('../fetch.js');
var _ = require('lodash');
var urlTool = require('url');

module.exports = function(callback) {
  var options = {
    pageTpl: `http://m.zhaopin.com/anhui-hefei-664/?keyword=%E5%89%8D%E7%AB%AF&pageindex={page}`,
    handleContent: function($) {
      var list = $('.r_searchlist .listbox a');
      return _.map(list, function(item) {
        return {
          companyName: $(item).find('.companyname').text(),
          salary: $(item).find('.salary').text(),
          link: urlTool.resolve(options.pageTpl, $(item).attr('href')),
          src: '智联招聘'
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