var src = `/job/`;


var defaultIgnoreCompanies = [
  '中青中关村软件人才基地',
  '达内',
  // '医院',
  // '万户',
  // '万有',
  '凯捷',
  '小猪'
];

var localIgnoreCompanies = JSON.parse(localStorage.getItem('ignoreCompanies')) || [];

function isIgnoredCompany(companyName) {
  var ignoreCompanies = defaultIgnoreCompanies.concat(localIgnoreCompanies);
  return ignoreCompanies.some(function(item) {
    var r = new RegExp(item);
    return r.test(companyName);
  });
}

function ignoreCompany(keyword) {
  localIgnoreCompanies.push(keyword);
  localStorage.setItem('ignoreCompanies', JSON.stringify(localIgnoreCompanies));
}

document.documentElement.addEventListener('transitionend', function(event) {
  var target = event.target;
  if ( target.matches('.jobList-item.hidden') ) {
    target.remove();
  }
}, false);

document.documentElement.addEventListener('click', function(event) {
  var target = event.target;
  if ( target.matches('.jobList-item-hideBtn') ) {
    var companyName = target.closest('.list-item-right')
      .querySelector('.list-item-text-title')
      .innerHTML
      .trim();

    var msg = `确定要隐藏 ==${companyName}== 发布的信息吗?`;

    var confirmation = confirm(msg);
    if (confirmation) {
      ignoreCompany(companyName);
      target.closest('.jobList-item').classList.add('hidden');
    }
  }
}, false);

fetch(src).then(res => res.json())
  .then(function(res) {
    var curtVisitTime = Date.now();
    var lastVisitTime = localStorage.getItem('lastVisitTime') || curtVisitTime;
    localStorage.setItem('lastVisitTime', curtVisitTime);

    var allJobs = _.chain(res.allResult)
      .filter(function(item) {
        return !isIgnoredCompany(item.companyName);
      })
      .sort(function(a, b) {
        return b.fetchTime - a.fetchTime;
      })
      .map(function(item) {
        return Object.assign({}, item, {
          date: moment(item.fetchTime).format('YYYY年MM月DD日'),
          newSinceLastVisit: item.fetchTime > lastVisitTime
        });
      })
      .groupBy('date')
      .reduce(function(preVal, value, key) {
        preVal.push({
          date: key,
          data: value
        });
        return preVal;
      }, [])
      .sort(function(a, b) {
        return b.date - a.date;
      })
      .value();

    var vm = {
      allJobs: allJobs,
      count: res.allResult.length
    };


    ko.applyBindings(vm);
    document.querySelector('.pageContent').classList.add('ready');
    document.querySelector('.splashScreen').classList.add('hidden');

  });
