var fs = require('fs');
var log4js = require('log4js');
var moment = require('moment');
var Logger = log4js.getLogger();

eval(fs.readFileSync('target/js/gitline.min.js', 'utf8'));

exports.Commit = Gitline.Commit;
exports.Gitline = Gitline;