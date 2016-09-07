let _ = require('lodash');
let urlTool = require('url');

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
        companyName: $(item).find('aside').text().trim(),
        salary: $(item).find('em').text().trim(),
        link: urlTool.resolve(url, $(item).attr('href')).trim(),
        src: '51job',
        title: $(item).find('h3').text().trim(),
        location: $(item).find('i').text().trim()
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
