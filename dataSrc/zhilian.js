let _ = require('lodash');
let urlTool = require('url');
let fetchHtml = require('../fetchHtml.js');


module.exports = function() {
  let options = {};

  options.src = _.map(arguments, function(item) {
    return {
      keyword: encodeURIComponent(item),
      gbk: false
    }
  });

  options.urlTpl = `http://m.zhaopin.com/anhui-hefei-664/?` +
    `keyword={keyword}&` +
    `pageindex={page}`;

  options.handleContent = function(res) {
    let url = res.url;
    let $ = res.$;

    let list = $('.r_searchlist .listbox a');
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

  return fetchHtml(options);
};
