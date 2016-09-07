let _ = require('lodash');
let urlTool = require('url');
let Rx = require('rx');
let rxRequest = require('../rxRequest.js');


function fetchContent(keyword) {
  let source = Rx.Observable.range(1, 3)
    .flatMap(function(pageCount) {
      return rxRequest({
        method: 'POST',
        url: `http://www.lagou.com/jobs/positionAjax.json?px=new&` +
             `city=%E5%90%88%E8%82%A5`,
        timeout: 8000,
        form: {
          first: false,
          pn: pageCount,
          kd: keyword
        }
      });
    })
    .retry(3)
    .map(function(res) {
      return JSON.parse(res.body).content.result;
    })
    .map(function(result) {
      return result.map(function(item) {
        return {
          companyName: item.companyName,
          salary: item.salary,
          link: `http://www.lagou.com/jobs/${item.positionId}.html`,
          src: `拉钩网`,
          title: item.positionName
        };
      });
    });

  return source;
}

module.exports = function() {
  let src = _.map(arguments, function(item) {
    return fetchContent(item);
  });

  let ret = Rx.Observable.merge.apply(null, src)
    .reduce(function(preVal, curItem) {
      return preVal.concat(curItem);
    }, []);

  return ret;
};
