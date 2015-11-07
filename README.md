![gitline sample](https://github.com/blecher-at/gitline/blob/master/doc/gitline.png)

gitline - A git history to HTML renderer implemented in TypeScript
===========

[![Join the chat at https://gitter.im/blecher-at/gitline](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/blecher-at/gitline?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

The idea is to have this on a central server or your local machine, to keep tabs on what your team is doing :)
Needs a JSON file as input (generated with [git2json](https://github.com/blecher-at/git2json))

gitline tries to be aware of your branching scheme. It will autodetect the category and assignment of branches and groups commits accordingly.

Installation / Setup of development environment
------------------
- Install Node.js
- Install a simple web server: `npm install -g serve` or use [devd](https://github.com/cortesi/devd)
- Install TypeScript: `npm install -g typescript`
- Install [git2json](https://github.com/blecher-at/git2json)
- Run `tsc --watch` in project's root folder in a second terminal window to compile TypeScript on the fly when a file changes
- Run `serve` in project's root folder or start devd accordingly

Creating sample data
------------------
- run `git json > myfile.json` - in a cronjob presumably
- point `src/index.html` to the newly created JSON file

Imports / Third party
------------------
- Programming language: [TypeScript](http://www.typescriptlang.org/)
- SVG Rendering: [JSGL](http://www.jsgl.org/)  
- Generic JS framework: [jQuery](https://jquery.org/)

Legal
-----
Licensed under the Affero GPLv3 (https://www.gnu.org/licenses/agpl-3.0.html), which basically says: you are free to hack and use, but if you want to build a product out of it, or host it as a service, we need to talk.
