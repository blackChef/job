let _ = require('lodash');
let urlTool = require('url');
let fetchHtml = require('../fetchHtml.js');
let iconv = require('iconv-lite');


module.exports = function(...keywords) {

  let urlTpl = `http://m.goodjobs.cn/list.php?` +
    `boxwpve=1043&` +
    `keyword={keyword}&` +
    `page={page}`;

  let isGbk = true;

  let handleContent = function ({ url, $ }) {
    let list = $('.jobview_lists a');

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


  return fetchHtml({
    keywords,
    urlTpl,
    isGbk,
    handleContent
  });
};
