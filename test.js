var fs = require('fs-extra');
var content = fs.readFileSync('./lastResult.json').toString();
console.log(content);