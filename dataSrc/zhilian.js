let _ = require('lodash');
let urlTool = require('url');
let fetchHtml = require('../fetchHtml.js');


module.exports = function(...keywords) {
  let urlTpl = `http://m.zhaopin.com/anhui-hefei-664/?` +
    `keyword={keyword}&` +
    `pageindex={page}`;

  let handleContent = function({ url, $ }) {
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

  return fetchHtml({
    keywords,
    urlTpl,
    handleContent
  });
};
