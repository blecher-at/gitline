var fs = require('fs');
var log4js = require('log4js');
var Logger = log4js.getLogger();

eval(fs.readFileSync('target/js/gitline.min.js', 'utf8'));

exports.Commit = Commit;
exports.Gitline = Gitline;