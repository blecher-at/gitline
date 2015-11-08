![gitline sample](https://github.com/blecher-at/gitline/blob/master/doc/gitline.png)

gitline - A git history to HTML renderer implemented in TypeScript
===========

The idea is to have this on a central server or your local machine, to keep tabs on what your team is doing :)
Needs a JSON file as input (generated with [git2json](https://github.com/blecher-at/git2json))

gitline tries to be aware of your branching scheme. It will autodetect the category and assignment of branches and groups commits accordingly.

Installation / Setup of development environment
-----
- Install Node.js
- Install dependencies: `npm install`
- Run `gulp watch` in project's root folder in a second terminal window to compile TypeScript on the fly when a file changes
- To run, execute `gulp run` in project's root folder, then visit http://localhost:3000
- To test, execute `gulp test`

Creating sample data
-----
- Install [git2json](https://github.com/blecher-at/git2json)
- run `git json > myfile.json` - in a cronjob presumably
- point `src/index.html` to the newly created JSON file

Imports / Third party
-----
- Programming language: [TypeScript](http://www.typescriptlang.org/)
- SVG Rendering: [JSGL](http://www.jsgl.org/)  
- Generic JS framework: [jQuery](https://jquery.org/)
- Hash Generation: [Crypto JS](https://github.com/brix/crypto-js)

Legal / License
-----
Licensed under the [Affero GPLv3](LICENSE), which basically says: You are free to hack and use,
but if you want to build a product out of it, or host it as a service, we need to talk.
