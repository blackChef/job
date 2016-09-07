let Rx = require('rx');
let _ = require('lodash');
let fs = require('fs-extra');

function getCoreCompanyName(name) {
  return name
    .replace(/^(安徽省?|合肥市?|北京|上海|深圳|南京|杭州|广州|浙江)/, '')
    .replace(/(网络|软件|信息|科技|技术|电子商务).*$/, '')
    .replace(/(股份)?有限公司.*$/, '')
    .replace(/集团.*$/, '')
    .replace(/(安徽|合肥)分公司.*$/, '');
}


let assignOtherInfo = function(item) {
  let companyName = item.companyName.trim();
  let title = item.title.trim();

  return _.assign({}, item, {
    companyName: getCoreCompanyName(companyName),
    fetchTime: Date.now(),
    identity: JSON.stringify([title, companyName]),
  });
};

let isSameIdentity = function(a, b) {
  return _.isEqual(a.identity, b.identity);
};

// parseResult :: [jobItem] -> [uniqJobItem]
let parseResult = function(result) {
  return _.chain(result)
    .map(assignOtherInfo)
    .uniqWith(isSameIdentity)
    .value();
};

let getAllResult = function() {
  if (!fs.existsSync('./allResult.json')) {
    fs.outputJSONSync('./allResult.json', []);
  }

  return fs.readJSONSync('./allResult.json');
};


// fetchAllSrc :: Rx src => [src] -> callback
let fetchAllSrc = function(src, callback) {
  let source = Rx.Observable
    .concat(...src)
    .reduce(function(preVal, curItem) {
      return preVal.concat(curItem);
    }, []);

  let subscription = source.subscribe(
    function(result) {
      let latestResult = parseResult(result);
      let allResult = getAllResult();
      let newResult = _.differenceBy( latestResult, allResult, _.property('identity') );

      if (newResult.length > 0) {
        allResult = allResult.concat(newResult);
        fs.outputJSONSync('./allResult.json', allResult);
      }

      callback(null, allResult, newResult);
    },

    function(err) {
      callback(err);
    },

    _.empty
  );
};


module.exports = fetchAllSrc;
