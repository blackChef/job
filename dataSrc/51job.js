let _ = require('lodash');
let urlTool = require('url');
let fetchHtml = require('../fetchHtml.js');

module.exports = function(...keywords) {
  let isGbk = false;

  let urlTpl = ``+
    `http://m.51job.com/search/joblist.php?` +
    `jobarea=150200&` +
    `keyword={keyword}&pageno={pageIndex}`;

  let handleContent = function ({ url, $ }) {
    let list = $('.jblist > a');

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

  return fetchHtml({
    keywords,
    urlTpl,
    isGbk,
    handleContent
  });
};
