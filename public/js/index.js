var src = `/job/`;


var defaultIgnoredCompanies = [
];

var localIgnoredCompanies = JSON.parse(localStorage.getItem('ignoredCompanies')) || [];

function isIgnoredCompany(companyName) {
  var ignoredCompanies = defaultIgnoredCompanies.concat(localIgnoredCompanies);
  return ignoredCompanies.some(function(item) {
    var r = new RegExp(item);
    return r.test(companyName);
  });
}

function ignoreCompany(keyword) {
  localIgnoredCompanies.push(keyword);
  localStorage.setItem('ignoredCompanies', JSON.stringify(localIgnoredCompanies));
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



var ignoredTitles = [
  '设计',
  '游戏',
  '美工',
  /实习|训/,
  /\.net/i,
  /java(?!script)/i,
  /php/i,
  '销售',
  '经理',
];

function isIgnoredTitle(title) {
  return ignoredTitles.some(function(item) {
    var r = new RegExp(item);
    return r.test(title);
  });
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}


fetch(src)
  .then(checkStatus)
  .then(parseJSON)
  .then(function(res) {
    var curtVisitTime = Date.now();
    var lastVisitTime = localStorage.getItem('lastVisitTime') || curtVisitTime;
    localStorage.setItem('lastVisitTime', curtVisitTime);

    var allJobs = _.chain(res.allResult)
      .filter(function(item) {
        return !isIgnoredCompany(item.companyName) && !isIgnoredTitle(item.title);
      })
      .sort(function(a, b) {
        return b.fetchTime - a.fetchTime;
      })
      .map(function(item) {
        return Object.assign({}, item, {
          date: moment(item.fetchTime).format('YYYY年MM月DD日'),
          newSinceLastCheck: item.fetchTime > lastVisitTime
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

  })
  .catch(function(err) {
    alert(err.message);
  });



