var fs = require('fs'),
  content = fs.readFileSync('./target/gitline.js', 'utf8');
eval(content);
exports.Commit = Commit;
exports.Gitline = Gitline;
