var fs = require('fs'),
  content = fs.readFileSync('./target/js/gitline.min.js', 'utf8');
eval(content);
exports.Commit = Commit;
exports.Gitline = Gitline;
