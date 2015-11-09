var fs = require('fs'),
  content = fs.readFileSync('./target/gitline.js', 'utf8');
  content += fs.readFileSync('./src/main/external/logger.min.js', 'utf8');
eval(content);
exports.Logger = Logger;
exports.Commit = Commit;
exports.Gitline = Gitline;
