let _ = require('lodash');
let urlTool = require('url');


module.exports = function(...keywords) {
  let isGbk = false;

  let urlTpl = `` +
  `http://sou.zhaopin.com/jobs/searchresult.ashx?`+
  `jl=%E5%90%88%E8%82%A5&kw={keyword}&sm=0&p={pageIndex}`


  let handleContent = function({ url, $ }) {
    let list = $('.newlist_list_content table:not(:first-child) tr:first-child');

    return _.map(list, function(item) {
      return {
        companyName: $(item).find('.gsmc').text().trim(),
        salary: $(item).find('.zwyx').text().trim(),
        link: urlTool.resolve(url, $(item).find('.zwmc a').attr('href')).trim(),
        src: '智联招聘',
        title: $(item).find('.zwmc').text().trim(),
        location: $(item).find('.gzdd').text().trim()
      };
    });
  };

  return {
    keywords,
    urlTpl,
    isGbk,
    handleContent
  };
};
