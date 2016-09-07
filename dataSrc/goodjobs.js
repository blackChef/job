let _ = require('lodash');
let urlTool = require('url');
let iconv = require('iconv-lite');


module.exports = function(...keywords) {

  let urlTpl = `http://m.goodjobs.cn/list.php?` +
    `boxwpve=1043&` +
    `keyword={keyword}&` +
    `page={pageIndex}`;

  let isGbk = true;

  let handleContent = function ({ url, $ }) {
    let list = $('.jobview_lists a');

    return _.map(list, function(item) {
      return {
        companyName: $(item).find('.corp_name').text().trim(),
        salary: $(item).find('.apply_name i').text().trim(),
        link: urlTool.resolve(url, $(item).attr('href')).trim(),
        src: '新安人才网',
        title: $(item).find('.job_name').text().trim(),
        location: $(item).find('.apply_name span').text().trim()
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
