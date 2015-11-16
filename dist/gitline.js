var Gitline;
(function (Gitline) {
    var AsyncLoadingItem = (function () {
        function AsyncLoadingItem(label, data, callback, index, of) {
            this.label = label;
            this.data = data;
            this.callback = callback;
            this.index = index;
            this.of = of;
        }
        return AsyncLoadingItem;
    })();
    var AsyncLoader = (function () {
        function AsyncLoader(element) {
            this.items = [];
            this.suspended = false;
            this.element = element;
        }
        /** do this async, display the label and the data */
        AsyncLoader.prototype.then = function (label, datacallback, callback) {
            var _this = this;
            this.thenSingle(label, function () {
                // add it to the beginning of the queue
                var data = datacallback();
                for (var i = data.length - 1; i >= 0; i--) {
                    _this.items.unshift(new AsyncLoadingItem(label, data[i], callback, i, data.length));
                }
            });
            return this;
        };
        AsyncLoader.prototype.thenSingle = function (label, callback) {
            this.items.push(new AsyncLoadingItem(label, null, callback, 0, 1));
            return this;
        };
        AsyncLoader.prototype.start = function (shield) {
            if (shield === void 0) { shield = true; }
            if (shield) {
                this.element.hidden = false;
            }
            this.next();
        };
        AsyncLoader.prototype.next = function () {
            var _this = this;
            var nextItem = this.items.shift();
            if (nextItem !== undefined) {
                // avoid yielding control unnecessarily, but limit stack depth at the same time
                if ((nextItem.index % 50) === 0) {
                    this.showStatus(nextItem);
                    window.setTimeout(function () {
                        Logger.debug("executing " + nextItem.label + " (" + nextItem.index + "/" + nextItem.of + ")");
                        _this.execute(nextItem);
                    }, 0);
                }
                else {
                    this.execute(nextItem);
                }
            }
            else {
                this.element.hidden = true;
            }
        };
        AsyncLoader.prototype.suspend = function () {
            this.suspended = true;
        };
        AsyncLoader.prototype.resume = function () {
            this.suspended = false;
            this.next();
        };
        AsyncLoader.prototype.showStatus = function (item) {
            this.element.innerHTML = item.label; // + " ("+item.index + "/"+item.of+")";
        };
        AsyncLoader.prototype.execute = function (item) {
            try {
                item.callback(item.data);
                if (!this.suspended) {
                    this.next();
                }
            }
            catch (e) {
                this.error(e);
            }
        };
        AsyncLoader.prototype.error = function (e) {
            Logger.error(e);
            this.element.innerHTML = e;
            this.suspend();
        };
        return AsyncLoader;
    })();
    Gitline.AsyncLoader = AsyncLoader;
})(Gitline || (Gitline = {}));
///<reference path="typedefs/cryptojs.d.ts"/>
var Gitline;
(function (Gitline) {
    function indexToX(index) {
        return index * 20 + 12;
    }
    Gitline.indexToX = indexToX;
    var Config = (function () {
        function Config() {
            this.dotHeight = 6;
            this.dotWidth = 8;
            this.remoteOnly = false;
            this.avatars = [this.avatar_gravatar];
        }
        Config.prototype.avatar_gravatar = function (email) {
            return "http://www.gravatar.com/avatar/" + CryptoJS.MD5(email.toLowerCase()) + "?s=16&d=mm";
        };
        return Config;
    })();
    Gitline.Config = Config;
})(Gitline || (Gitline = {}));
var Gitline;
(function (Gitline) {
    var CommitProvider = (function () {
        function CommitProvider(url) {
            this.url = url;
        }
        CommitProvider.prototype.whenDone = function (data) {
            this.callback(data);
        };
        CommitProvider.prototype.withErrorCallback = function (callbackFn) {
            this.errorCallback = callbackFn;
        };
        CommitProvider.prototype.withCallback = function (callbackFn) {
            this.callback = callbackFn;
        };
        /** this method should be overwritten. it must call whenDone(data) when all data was loaded. */
        CommitProvider.prototype.onRequested = function (url) {
            throw new Error("onRequested not implemented on " + this);
        };
        CommitProvider.prototype.request = function () {
            this.onRequested(this.url);
        };
        CommitProvider.prototype.error = function (e) {
            this.errorCallback(e);
        };
        return CommitProvider;
    })();
    Gitline.CommitProvider = CommitProvider;
})(Gitline || (Gitline = {}));
var Gitline;
(function (Gitline) {
    /**
     * Elements with two contents, that expand on double click
     */
    var Expandable = (function () {
        function Expandable() {
        }
        Expandable.extend = function (element) {
            var extended = element;
            element.classList.add("gitline-expandable");
            extended.whenFull = function (innerHTML) {
                extended.onclick = function (event) {
                    extended.innerHTML = innerHTML;
                    event.cancelBubble = true;
                    element.classList.add("gitline-expandable-expanded");
                };
            };
            extended.whenShort = function (innerHTML) {
                extended.innerHTML = innerHTML;
                extended.onmouseout = function () {
                    extended.innerHTML = innerHTML + " ";
                    element.classList.remove("gitline-expandable-expanded");
                };
            };
            return extended;
        };
        return Expandable;
    })();
    Gitline.Expandable = Expandable;
})(Gitline || (Gitline = {}));
///<reference path="../CommitProvider.ts"/>
///<reference path="../Main.ts"/>
///<reference path="../typedefs/jquery.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Gitline;
(function (Gitline) {
    var Plugin;
    (function (Plugin) {
        var LocalGit2JsonProvider = (function (_super) {
            __extends(LocalGit2JsonProvider, _super);
            function LocalGit2JsonProvider() {
                _super.apply(this, arguments);
            }
            LocalGit2JsonProvider.prototype.onRequested = function (url) {
                var _this = this;
                var xhr = jQuery.getJSON(url, {});
                xhr.done(function (json) {
                    _this.whenDone(json);
                });
                xhr.fail(function () {
                    _this.error("Error loading git data from " + url + " create it using git2json");
                });
            };
            return LocalGit2JsonProvider;
        })(Gitline.CommitProvider);
        Plugin.LocalGit2JsonProvider = LocalGit2JsonProvider;
    })(Plugin = Gitline.Plugin || (Gitline.Plugin = {}));
})(Gitline || (Gitline = {}));
///<reference path="../CommitProvider.ts"/>
///<reference path="../typedefs/jquery.d.ts"/>
var Gitline;
(function (Gitline) {
    var Plugin;
    (function (Plugin) {
        /**
         * GitHub commit provider. only works if there is and accesstoken configured in the browser
         */
        var GithubCommitProvider = (function (_super) {
            __extends(GithubCommitProvider, _super);
            function GithubCommitProvider(url, limit, accessToken) {
                _super.call(this, url);
                this.forks = [];
                this.baseBranches = [];
                this.data = {};
                this.accessToken = accessToken;
                this.limit = limit;
            }
            GithubCommitProvider.prototype.gitURL = function (url, api, params) {
                if (params === void 0) { params = ""; }
                // convert to api url and remove trailing /
                if (url.indexOf("api.github.com") == -1) {
                    url = url.replace(/.*github.com/, "https://api.github.com/repos/").replace(/\/\//g, "/");
                }
                return url + "/" + api + "?access_token=" + this.accessToken + "&per_page=" + this.limit + "&callback=?&" + params;
            };
            GithubCommitProvider.prototype.onRequested = function (url) {
                this.loadForks(url);
            };
            GithubCommitProvider.prototype.loadForks = function (url) {
                var _this = this;
                jQuery.getJSON(this.gitURL(url, "forks")).done(function (forks) {
                    if (forks.data.message === "Bad credentials") {
                        _this.error("Github API: " + forks.data.message);
                        return;
                    }
                    jQuery.getJSON(_this.gitURL(url, "branches")).done(function (branches) {
                        _this.processBranches(url, branches.data);
                        _this.forks = forks.data;
                        _this.loadBranches();
                    });
                });
            };
            GithubCommitProvider.prototype.processBranches = function (fork, data) {
                var _this = this;
                data.forEach(function (branch) {
                    branch.repo = fork.url !== undefined ? fork.url : fork;
                    if (fork.full_name !== undefined) {
                        branch.name = branch.name + "@" + fork.full_name;
                    }
                    _this.baseBranches.push(branch);
                });
            };
            GithubCommitProvider.prototype.loadBranches = function () {
                var _this = this;
                var forkRequests = this.forks.map(function (fork) {
                    return jQuery.getJSON(_this.gitURL(fork.url, "branches"), function (data) {
                        Logger.debug("loaded branches for " + fork.name);
                        _this.processBranches(fork, data.data);
                    });
                });
                jQuery.when.apply(jQuery, forkRequests).done(function () {
                    Logger.debug("all branches loaded");
                    _this.loadCommits();
                });
            };
            GithubCommitProvider.prototype.loadCommits = function () {
                var _this = this;
                var commitRequests = [];
                this.baseBranches.forEach(function (b) {
                    var commit = _this.data[b.commit.sha];
                    if (commit == undefined) {
                        commitRequests.push(jQuery.getJSON(_this.gitURL(b.repo, "commits", "sha=" + b.commit.sha), function (data) {
                            Logger.debug("loaded commits for " + b.name);
                            _this.processCommits(data.data);
                        }));
                    }
                });
                jQuery.when.apply(jQuery, commitRequests).done(function () {
                    _this.process();
                });
            };
            GithubCommitProvider.prototype.processCommits = function (data) {
                var _this = this;
                data.map(function (data) {
                    var c = {};
                    c.sha = data.sha;
                    c.ssha = data.sha.substring(0, 8);
                    c.parenthashes = data.parents.map(function (x) {
                        return x.sha;
                    });
                    c.authorname = data.commit.author.name;
                    c.authoremail = data.commit.author.email;
                    c.authordate = data.commit.author.date;
                    c.authortimestamp = new Date(data.commit.author.date).getTime();
                    c.committername = data.commit.committer.name;
                    c.committeremail = data.commit.committer.email;
                    c.committerdate = data.commit.committer.date;
                    c.committertimestamp = new Date(data.commit.committer.date).getTime();
                    c.subject = data.commit.message;
                    c.body = ""; // Todo: where to get this?
                    c.refnames = []; // set when parsing branches
                    c.inHeads = []; // set when parsing branches
                    return c;
                }).forEach(function (commit) {
                    _this.data[commit.sha] = commit;
                });
            };
            GithubCommitProvider.prototype.process = function () {
                var _this = this;
                this.baseBranches.forEach(function (b) {
                    var commit = _this.data[b.commit.sha];
                    if (commit == undefined) {
                    }
                    else {
                        b.assigned = true;
                        commit.refnames.push(b.name);
                        _this.assignHeads(commit);
                    }
                });
                // Sort
                var newdata = {};
                Object.keys(this.data).sort(function (a, b) {
                    return _this.data[b].committertimestamp - _this.data[a].committertimestamp;
                }).forEach(function (sha) {
                    newdata[sha] = _this.data[sha];
                });
                this.whenDone(newdata);
            };
            GithubCommitProvider.prototype.assignHeads = function (commit) {
                var _this = this;
                commit.parents1 = commit.parenthashes.map(function (x) {
                    return x;
                }); // copy array
                while (commit.parents1.length > 0) {
                    var newParents = [];
                    commit.parents1.forEach(function (parentHash) {
                        var p = _this.data[parentHash];
                        if (p != undefined) {
                            p.inHeads.push(commit.sha);
                            // add all grandparents to the newparents
                            p.parenthashes.forEach(function (h) {
                                if (newParents.indexOf(h) === -1) {
                                    newParents.push(h);
                                }
                            });
                        }
                    });
                    commit.parents1 = newParents;
                }
            };
            return GithubCommitProvider;
        })(Gitline.CommitProvider);
        Plugin.GithubCommitProvider = GithubCommitProvider;
    })(Plugin = Gitline.Plugin || (Gitline.Plugin = {}));
})(Gitline || (Gitline = {}));
///<reference path="Commit.ts"/>
///<reference path="AsyncLoader.ts"/>
///<reference path="Config.ts"/>
///<reference path="CommitProvider.ts"/>
///<reference path="Branch.ts"/>
///<reference path="Expandable.ts"/>
///<reference path="plugins/LocalGit2JsonProvider.ts"/>
///<reference path="plugins/GithubCommitProvider.ts"/>
var Gitline;
(function (Gitline) {
    function create() {
        return new Main();
    }
    Gitline.create = create;
    var Main = (function () {
        function Main() {
            this.maxX = 0;
            this.maxIndexY = 0;
            this.commits = {};
            this.headsMap = {};
            this.config = new Gitline.Config();
        }
        Main.prototype.addCommit = function (commit) {
            this.commits[commit.getFullSha()] = commit;
            // first commit needed by rendering
            if (this.firstCommit === undefined) {
                this.firstCommit = commit;
            }
        };
        Main.prototype.addBranch = function (refname, commit, specifity) {
            this.headsMap[refname] = new Gitline.Branch(refname, commit, specifity);
        };
        Main.prototype.render = function () {
            var _this = this;
            this.canvas = new jsgl.Panel(this.graphicalPanel);
            this.al.thenSingle("Loading Data", function () {
                _this.al.suspend();
                _this.commitProvider.withCallback(function (json) {
                    _this.data = json;
                    _this.al.resume();
                });
                _this.commitProvider.request();
            }).then("Loading Commits", function () {
                return Object.keys(_this.data);
            }, function (sha) {
                var commit = new Gitline.Commit(_this, _this.data[sha]);
                _this.addCommit(commit);
            })
                .thenSingle("Building Graph", function () {
                _this.buildGraph();
            })
                .then("Drawing Labels", function () {
                return Object.keys(_this.commits);
            }, function (sha) {
                var commit = _this.commits[sha];
                _this.drawCommit(commit);
            })
                .thenSingle("Creating Legend", function () {
                _this.rootLabel = document.createElement('div');
                _this.rootLabel.className = "commit-legend";
                _this.textPanel.appendChild(_this.rootLabel);
            })
                .then("Drawing Merges", function () {
                return Object.keys(_this.commits);
            }, function (sha) {
                var commit = _this.commits[sha];
                _this.drawReferences(commit);
            })
                .thenSingle("Resizing", function () {
                _this.graphicalPanel.style.width = Gitline.indexToX(_this.maxX + 1) + "px";
                _this.graphicalPanel.style.height = _this.getHeight() + "px";
            }).start();
            window.onresize = function () {
                _this.al.then("Redrawing", function () {
                    return Object.keys(_this.commits);
                }, function (sha) {
                    var commit = _this.commits[sha];
                    commit.view.redraw();
                }).thenSingle("Resizing", function () {
                    _this.graphicalPanel.style.width = Gitline.indexToX(_this.maxX + 1) + "px";
                    _this.graphicalPanel.style.height = _this.getHeight() + "px";
                }).start(false);
            };
        };
        Main.prototype.getHeight = function () {
            return this.rootLabel.offsetTop - this.firstCommit.view.label.offsetTop;
        };
        Main.prototype.buildGraph = function () {
            var _this = this;
            var shas = Object.keys(this.commits);
            shas.forEach(function (sha) {
                var commit = _this.commits[sha];
                commit.initRelations();
            });
            shas.forEach(function (sha) {
                var commit = _this.commits[sha];
                commit.initHeadSpecifity();
                commit.initMerges();
            });
            this.initBranches();
        };
        Main.prototype.drawCommit = function (commit) {
            // Label
            commit.view = new Gitline.CommitView(this.canvas, this.config, commit);
            if (commit.outOfScope === false) {
                commit.view.label = this.drawLabel(commit);
                commit.view.label.onclick = function () {
                    if (console) {
                        Logger.debug(commit);
                    }
                };
                this.textPanel.appendChild(commit.view.label);
                commit.view.label.style['padding-left'] = Gitline.indexToX(this.maxX + 1) + "px";
            }
        };
        Main.prototype.drawReferences = function (commit) {
            commit.view.addRelations();
            commit.view.redraw();
        };
        Main.prototype.drawLabel = function (commit) {
            var label = document.createElement('div');
            label.className = "commit-legend";
            // SHA Hash
            var shortSha = commit.getShortSha();
            var fullSha = commit.getFullSha();
            var sha = Gitline.Expandable.extend(document.createElement("span"));
            sha.whenShort(shortSha + " ");
            sha.whenFull(fullSha);
            sha.style.fontFamily = "Courier";
            label.appendChild(sha);
            // Author and committer
            label.appendChild(this.drawIdentity("author", commit.author));
            if (commit.author.email != commit.committer.email) {
                label.appendChild(this.drawIdentity("committer", commit.committer));
            }
            // Branch - TODO: Tags and other branches
            if (commit.branch && commit.branch.commit === commit && !commit.branch.anonymous) {
                var head = document.createElement("span");
                head.className = "head-label";
                head.style.backgroundColor = commit.getColor(40);
                head.style.color = "white";
                head.style.paddingLeft = head.style.paddingRight = "2px";
                head.innerHTML = commit.branch.ref;
                label.appendChild(head);
            }
            // Subject
            var subject = document.createElement("span");
            subject.innerHTML = " " + commit.subject;
            subject.style.color = commit.hasMerges() ? "grey" : "black";
            label.appendChild(subject);
            label.style.position = "relative";
            return label;
        };
        Main.prototype.drawIdentity = function (type, id) {
            var el = Gitline.Expandable.extend(document.createElement("gitline-identity"));
            el.setAttribute("class", type);
            el.setAttribute("name", id.name);
            var fullname = id.name + " &lt;" + id.email.toLowerCase() + "&gt;";
            el.setAttribute("title", id.name + " <" + id.email.toLowerCase() + ">");
            el.style.background = this.config.avatars.map(function (f) {
                return "url(" + f(id.email) + ") no-repeat";
            }).join(", ");
            el.whenFull(fullname);
            el.whenShort(" ");
            return el;
        };
        /*
         Based on the specifity assign the branches to the commits. if in doubt the commit will be on the most specific branch
         */
        Main.prototype.initBranches = function () {
            var heads = Object.keys(this.headsMap);
            /* set the index to the head object */
            for (var i = 0; i < heads.length; i++) {
                var headName = heads[i];
                var head = this.headsMap[headName];
                head.commit.initDefaultBranch();
            }
            /* Sort the branches by specifity */
            var self = this;
            heads.sort(function (l, r) {
                var lHead = self.headsMap[l].commit;
                var rHead = self.headsMap[r].commit;
                if (lHead === rHead) {
                    return 0;
                }
                if (lHead.branch.category === rHead.branch.category) {
                    return lHead.branch.specifity - rHead.branch.specifity;
                }
                else {
                    return lHead.branch.category.length - rHead.branch.category.length;
                }
            });
            /* set the index to the head object */
            var maxLane = 0;
            for (var i = 0; i < heads.length; i++) {
                var headName = heads[i];
                var head = this.headsMap[headName];
                var tip = head.commit;
                if (tip.branch === head) {
                    head.lane = maxLane;
                    //head.index = maxLane;
                    maxLane++;
                    // Can we display this head a little more to the left?
                    for (var l = 0; l < heads.length; l++) {
                        var canUseLane = true;
                        for (var j = 0; j < heads.length; j++) {
                            var jheadName = heads[j];
                            var headOnLane = this.headsMap[jheadName].commit;
                            if (headOnLane === undefined ||
                                headOnLane.branch != head &&
                                    headOnLane.branch.lane === l &&
                                    (tip.intersects(headOnLane) || tip.branch.category != headOnLane.branch.category)) {
                                canUseLane = false;
                            }
                        }
                        if (canUseLane) {
                            Logger.debug("NO INTERSECTS: ", tip.branch.ref, " - ", headOnLane.branch.ref);
                            head.lane = l;
                            break;
                        }
                    }
                    this.maxX = Math.max(this.maxX, head.lane);
                }
            }
        };
        // Launching
        Main.prototype.fromJSON = function (jsonFile) {
            return this.fromProvider(new Gitline.Plugin.LocalGit2JsonProvider(jsonFile));
        };
        Main.prototype.fromProvider = function (commitProvider) {
            this.commitProvider = commitProvider;
            return this;
        };
        Main.prototype.renderTo = function (panel) {
            if (this.headerPanel !== undefined) {
                panel.appendChild(this.headerPanel);
            }
            panel.appendChild(this.loadingPanel = document.createElement("gitline-loadingpanel"));
            panel.appendChild(this.contentPanel = document.createElement("gitline-contentpanel"));
            this.contentPanel.appendChild(this.graphicalPanel = document.createElement("gitline-graphicalpanel"));
            this.contentPanel.appendChild(this.textPanel = document.createElement("gitline-textpanel"));
            this.al = new Gitline.AsyncLoader(this.loadingPanel);
            this.render();
            return this;
        };
        Main.prototype.withHeader = function (header) {
            if (typeof header === "string") {
                this.headerPanel = document.createElement("gitline-headerpanel");
                this.headerPanel.innerHTML = header;
            }
            else {
                this.headerPanel = header;
            }
            return this;
        };
        return Main;
    })();
    Gitline.Main = Main;
})(Gitline || (Gitline = {}));
var Gitline;
(function (Gitline) {
    var Rendering;
    (function (Rendering) {
        /**
         * basic support for jsgl shapes
         */
        var Shape = (function () {
            function Shape(canvas, element) {
                this.dependencies = [];
                this.canvas = canvas;
                this.element = element;
            }
            Shape.prototype.addIfMissing = function () {
                if (this.element !== undefined && this.renderedTo == null) {
                    this.addElements();
                    this.renderedTo = this.canvas;
                }
            };
            Shape.prototype.addElements = function () {
                this.canvas.addElement(this.element);
            };
            Shape.prototype.update = function () {
                this.dependencies.forEach(function (dep) {
                    dep.update();
                });
            };
            Shape.prototype.dependsOn = function (on) {
                on.dependencies.push(this);
            };
            return Shape;
        })();
        Rendering.Shape = Shape;
    })(Rendering = Gitline.Rendering || (Gitline.Rendering = {}));
})(Gitline || (Gitline = {}));
///<reference path="Shape.ts"/>
var Gitline;
(function (Gitline) {
    var Rendering;
    (function (Rendering) {
        /**
         * Shape that links two dots
         */
        var BaseLink = (function (_super) {
            __extends(BaseLink, _super);
            function BaseLink(canvas, element) {
                _super.call(this, canvas, element);
            }
            BaseLink.prototype.from = function (from) {
                this.dependsOn(from);
                this.parentDot = from;
                return this;
            };
            BaseLink.prototype.to = function (to) {
                //this.dependsOn(to);
                this.childDot = to;
                return this;
            };
            BaseLink.prototype.color = function (lineColor) {
                this.element.getStroke().setWeight(1);
                this.element.getStroke().setColor(lineColor);
                this.lineColor = lineColor;
                this.addIfMissing();
                return this;
            };
            return BaseLink;
        })(Rendering.Shape);
        Rendering.BaseLink = BaseLink;
    })(Rendering = Gitline.Rendering || (Gitline.Rendering = {}));
})(Gitline || (Gitline = {}));
///<reference path="BaseLink.ts"/>
var Gitline;
(function (Gitline) {
    var Rendering;
    (function (Rendering) {
        var Curve = (function (_super) {
            __extends(Curve, _super);
            function Curve(canvas) {
                _super.call(this, canvas, canvas.createCurve());
                this.arrow = this.canvas.createPolygon();
            }
            Curve.prototype.addElements = function () {
                _super.prototype.addElements.call(this);
                // 2nd element
                this.canvas.addElement(this.arrow);
            };
            Curve.prototype.update = function () {
                var x = this.childDot.x;
                var y = this.childDot.y;
                var parentX = this.parentDot.x;
                var parentY = this.parentDot.y;
                var color = this.lineColor;
                var direction = x < parentX ? 1 : -1;
                this.element.setStartPointXY(parentX, parentY - this.parentDot.height / 2);
                this.element.setEndPointXY(x + this.childDot.width / 2 * direction, y);
                this.element.setControl2PointXY(parentX, y);
                this.element.setControl1PointXY(parentX, y);
                this.element.getStroke().setWeight(1);
                this.element.getStroke().setColor(color);
                this.arrow.getStroke().setWeight(0);
                this.arrow.getFill().setColor(color);
                this.arrow.clearPoints();
                this.arrow.addPointXY(0, 0);
                this.arrow.addPointXY(6, -4);
                this.arrow.addPointXY(6, 4);
                // Move
                for (var i = 0; i < this.arrow.getPointsCount(); i++) {
                    var px = this.arrow.getPointAt(i).X;
                    var py = this.arrow.getPointAt(i).Y;
                    //this.arrow.setPointXYAt(px, py + y, i);
                    this.arrow.setPointXYAt(px * direction + x + this.childDot.width / 2 * direction, py + y, i);
                }
            };
            return Curve;
        })(Rendering.BaseLink);
        Rendering.Curve = Curve;
    })(Rendering = Gitline.Rendering || (Gitline.Rendering = {}));
})(Gitline || (Gitline = {}));
///<reference path="BaseLink.ts"/>
var Gitline;
(function (Gitline) {
    var Rendering;
    (function (Rendering) {
        var Straight = (function (_super) {
            __extends(Straight, _super);
            function Straight(canvas) {
                _super.call(this, canvas, canvas.createLine());
            }
            Straight.prototype.update = function () {
                _super.prototype.update.call(this);
                this.element.setStartPointXY(this.parentDot.x, this.parentDot.y - this.parentDot.height / 2);
                this.element.setEndPointXY(this.childDot.x, this.childDot.y + this.childDot.height / 2);
            };
            return Straight;
        })(Rendering.BaseLink);
        Rendering.Straight = Straight;
    })(Rendering = Gitline.Rendering || (Gitline.Rendering = {}));
})(Gitline || (Gitline = {}));
///<reference path="BaseLink.ts"/>
var Gitline;
(function (Gitline) {
    var Rendering;
    (function (Rendering) {
        var Creation = (function (_super) {
            __extends(Creation, _super);
            function Creation(canvas) {
                _super.call(this, canvas, canvas.createLine());
                this.secondLine = canvas.createLine();
            }
            Creation.prototype.addElements = function () {
                _super.prototype.addElements.call(this);
                // 2nd element
                this.canvas.addElement(this.secondLine); // TODO: add later?
            };
            Creation.prototype.update = function () {
                _super.prototype.update.call(this);
                // Horizontal dotted line
                if (this.parentDot.x < this.childDot.x) {
                    this.element.setStartPointXY(this.parentDot.x + this.parentDot.width / 2, this.parentDot.y);
                }
                else {
                    this.element.setStartPointXY(this.parentDot.x - this.parentDot.width / 2, this.parentDot.y);
                }
                this.element.setEndPointXY(this.childDot.x, this.parentDot.y);
                this.element.getStroke().setWeight(1);
                this.element.getStroke().setDashStyle(jsgl.DashStyles.DASH);
                this.element.getStroke().setColor(this.lineColor);
                // Vertical line
                this.secondLine.setStartPointXY(this.childDot.x, this.parentDot.y);
                this.secondLine.setEndPointXY(this.childDot.x, this.childDot.y + this.childDot.height / 2);
                this.secondLine.getStroke().setWeight(1);
                this.secondLine.getStroke().setColor(this.lineColor);
            };
            return Creation;
        })(Rendering.BaseLink);
        Rendering.Creation = Creation;
    })(Rendering = Gitline.Rendering || (Gitline.Rendering = {}));
})(Gitline || (Gitline = {}));
/// <reference path="Shape.ts"/>
var Gitline;
(function (Gitline) {
    var Rendering;
    (function (Rendering) {
        var Dot = (function (_super) {
            __extends(Dot, _super);
            function Dot(canvas) {
                _super.call(this, canvas, canvas.createRectangle());
            }
            Dot.prototype.size = function (width, height) {
                this.width = width;
                this.height = height;
                this.element.setWidth(width);
                this.element.setHeight(height);
                this.element.setXRadius(width / 4);
                this.element.setYRadius(width / 4);
                this.update();
                this.addIfMissing();
                return this;
            };
            Dot.prototype.at = function (x, y) {
                this.x = x;
                this.y = y;
                this.update();
                this.addIfMissing();
                return this;
            };
            Dot.prototype.color = function (strokeColor, fillColor) {
                this.element.getStroke().setWeight(1);
                this.element.getStroke().setColor(strokeColor);
                this.element.getFill().setColor(fillColor);
                return this;
            };
            Dot.prototype.update = function () {
                this.element.setLocationXY(this.x - this.width / 2, this.y - this.height / 2);
                _super.prototype.update.call(this);
            };
            return Dot;
        })(Rendering.Shape);
        Rendering.Dot = Dot;
    })(Rendering = Gitline.Rendering || (Gitline.Rendering = {}));
})(Gitline || (Gitline = {}));
///<reference path="rendering/Curve.ts"/>
///<reference path="rendering/Straight.ts"/>
///<reference path="rendering/Creation.ts"/>
///<reference path="rendering/Dot.ts"/>
///<reference path="Config.ts"/>
///<reference path="Commit.ts"/>
///<reference path="rendering/Shape.ts"/>
var Gitline;
(function (Gitline) {
    /**
     * View of the Commit
     */
    var CommitView = (function () {
        function CommitView(canvas, config, commit) {
            this.lines = [];
            this.canvas = canvas;
            this.config = config;
            this.commit = commit;
            this.dot = new Gitline.Rendering.Dot(this.canvas);
        }
        CommitView.prototype.addRelations = function () {
            var _this = this;
            // Direct parent
            if (this.commit.directparent != null) {
                var dpl;
                if (this.commit.getLane() == this.commit.directparent.getLane() || this.commit.directparent.outOfScope) {
                    // direct parent is the same X/lane, this means it is a standard forward commit
                    dpl = new Gitline.Rendering.Straight(this.canvas).from(this.commit.directparent.view.dot).to(this.dot).color(this.commit.getColor(20));
                }
                else {
                    // direct parent is on a different lane, this is most certainly a new branch
                    dpl = new Gitline.Rendering.Creation(this.canvas).from(this.commit.directparent.view.dot).to(this.dot).color(this.commit.getColor(30));
                }
                this.lines.push(dpl);
            }
            var allmerges = this.commit.merges.standard.concat(this.commit.merges.anonymous);
            allmerges.forEach(function (merge) {
                _this.lines.push(new Gitline.Rendering.Curve(_this.canvas)
                    .from(merge.source.view.dot)
                    .to(_this.dot)
                    .color(merge.source.getColor(35)));
            });
        };
        /** calculate the positions based on model and update the shapes */
        CommitView.prototype.redraw = function () {
            this.dot
                .at(this.commit.getX(), this.commit.getY())
                .size(this.config.dotWidth, this.config.dotHeight)
                .color(this.commit.getColor(20), this.commit.getColor(80));
        };
        return CommitView;
    })();
    Gitline.CommitView = CommitView;
})(Gitline || (Gitline = {}));
///<reference path="Main.ts"/>
///<reference path="CommitView.ts"/>
///<reference path="Branch.ts"/>
var Gitline;
(function (Gitline) {
    /** committer or author */
    var Identity = (function () {
        function Identity(name, email, date) {
            this.name = name;
            this.email = email;
            this.date = date;
        }
        return Identity;
    })();
    Gitline.Identity = Identity;
    var Commit = (function () {
        function Commit(container, data) {
            this.warnings = [];
            this.inHeadsRef = [];
            this.parents = [];
            this.childs = [];
            this.siblings = [];
            this.outOfScope = false; // This commit was not part of the logs scope, but is referenced by another commit.
            this.merges = { standard: [], anonymous: [] };
            this.container = container;
            this.data = data;
            // reference the data back to the object
            this.data.obj = this;
            if (data.inHeads == null)
                data.inHeads = [];
            if (data.parenthashes == null)
                data.parenthashes = [];
            if (data.refnames == null)
                data.refnames = [];
            this.sha = data.sha;
            this.ssha = data.ssha;
            this.subject = data.subject;
            this.indexY = container.maxIndexY++;
            this.committer = new Identity(this.data.committername, this.data.committeremail, new Date(this.data.committerdate).getTime());
            this.author = new Identity(this.data.authorname, this.data.authoremail, new Date(this.data.authordate).getTime());
        }
        Commit.prototype.getShortSha = function () {
            return this.ssha;
        };
        Commit.prototype.getFullSha = function () {
            return this.sha;
        };
        Commit.prototype.initRelations = function () {
            var _this = this;
            var self = this;
            this.data.parenthashes.forEach(function (hash) {
                var parentCommit = _this.container.commits[hash];
                // Create a virtual commit
                if (parentCommit == null) {
                    parentCommit = new Commit(_this.container, { sha: hash + Math.random() });
                    parentCommit.outOfScope = true;
                    self.container.addCommit(parentCommit);
                }
                _this.parents.push(parentCommit);
                parentCommit.childs.push(_this);
                _this.siblings = parentCommit.childs; // this will be overwitten as new childs are found
                if (_this.parents.length > 0) {
                    var dp = _this.parents[0];
                    _this.directparent = dp;
                    dp.directchild = _this;
                }
            });
            this.data.inHeads.forEach(function (headsha) {
                var commit = _this.container.commits[headsha];
                if (_this.inHeadsRef.indexOf(commit) === undefined) {
                    _this.inHeadsRef.push(commit);
                }
            });
        };
        Commit.prototype.initDefaultBranch = function () {
            var commit = this;
            while (commit != null) {
                // GUESSING: The correct branch is usually the one with the least specific name
                if (commit.branch == null || commit.branch.specifity > this.branch.specifity) {
                    commit.branch = this.branch;
                }
                commit.branch.start = commit; // this function will traverse the parents, so the last one will be the first commit
                commit.branch.origin = commit.directparent; // this could be null -> it is outside of the history.
                commit = commit.directparent;
            }
        };
        Commit.prototype.initHeadSpecifity = function () {
            for (var i = 0; i < this.data.refnames.length; i++) {
                var refname = this.data.refnames[i];
                if (!this.container.config.remoteOnly || refname.indexOf("origin/") == 0) {
                    if (this.container.config.remoteOnly) {
                        refname = refname.replace(/^origin./, '');
                    }
                    var specifity = refname.replace(/[^\/-]/g, '').length * 1000;
                    specifity += refname.replace(/[^a-zA-Z0-9-]/, '').length;
                    this.container.addBranch(refname, this, specifity);
                    /* assign the most specific head on this tip commit */
                    if (this.maxSpecifity == null || specifity < this.maxSpecifity) {
                        Logger.debug("assigning branch", refname, this.sha, this.maxSpecifity, specifity);
                        this.maxSpecifity = specifity;
                        this.branch = this.container.headsMap[refname];
                    }
                    this.initDefaultBranch();
                }
            }
        };
        Commit.prototype.initMerges = function () {
            this.merges = { standard: [], anonymous: [] };
            this.warnings = [];
            // Detect a merge (octopus currently not supported)
            if (this.parents.length == 1) {
                var dp = this.parents[0];
                this.directparent = dp;
                dp.directchild = this;
            }
            if (this.parents.length >= 2) {
                var dp = this.parents[0];
                this.directparent = dp;
                dp.directchild = this;
                for (var i = 1; i < this.parents.length; i++) {
                    var mp = this.parents[i];
                    if (mp != null) {
                        // Clues if this is a standard or anonymous merge
                        if (mp.data.refnames.length > 0 // This is standard merge with mps head
                            || mp.inHeadsRef.length != dp.inHeadsRef.length // The heads of both are different
                        ) {
                            this.merges.standard.push({ source: mp });
                        }
                        else {
                            // This is a anonymous (automatic) merge on the same branch
                            this.merges.anonymous.push({ source: mp });
                            this.initAnonymous();
                        }
                    }
                }
            }
        };
        Commit.prototype.initAnonymous = function () {
            // Create a dummy branch for anonymous merges, which is as specific as the original branch.
            // try finding the original branch by going up direct childs, which will get the original
            var _this = this;
            this.merges.anonymous.forEach(function (_merge) {
                var merge = _merge.source;
                var child = _this;
                while (child != null && child.branch == null) {
                    child = child.directchild;
                }
                /* this is only an anonymous branch head, if there is only one child (the merge)
                 TODO: if there are multiple, it might result in wrongly assigned branches */
                if (child != null && merge.branch == null) {
                    merge.branch = new Gitline.Branch(child.branch.ref + "/anonymous" + merge.sha + Math.random(), merge, child.branch.specifity + 1);
                    merge.branch.anonymous = true;
                    merge.branch.parent = child.branch;
                    merge.branch.start = child;
                    merge.branch.category = child.branch.category;
                    _this.container.headsMap[merge.branch.ref] = merge.branch;
                }
            });
        };
        Commit.prototype.getColor = function (lightness) {
            if (this.branch == null) {
                this.warn("No Branch set");
            }
            else {
                var b = this.branch;
                if (this.branch.anonymous) {
                    b = this.branch.parent;
                }
                var hue = b.lane * 300 / this.container.maxX;
                return "hsl(" + hue + ", 100%, " + lightness + "%)";
            }
        };
        Commit.prototype.hasMerges = function () {
            return this.merges.standard.length > 0 || this.merges.anonymous.length > 0;
        };
        Commit.prototype.getX = function () {
            return Gitline.indexToX(this.getLane());
        };
        Commit.prototype.getY = function () {
            if (this.outOfScope) {
                return this.container.rootLabel.offsetTop + 20;
            }
            return this.view.label.offsetTop - this.container.firstCommit.view.label.offsetTop + this.view.label.offsetHeight / 2;
        };
        Commit.prototype.getOriginIndexY = function () {
            if (this.branch.origin != undefined) {
                return this.branch.origin.getIndexY();
            }
            else if (this.branch.start.outOfScope) {
                return this.container.maxIndexY;
            }
            else {
                return this.branch.start.indexY;
            }
        };
        /** Tip plus the next direct child index (position of last merge) */
        Commit.prototype.getTipPlusIndexY = function () {
            if (this.branch != undefined && this.branch.commit != undefined) {
                var indexY = this.branch.commit.indexY;
                // find the top child 
                this.branch.commit.childs.forEach(function (c) {
                    indexY = Math.min(indexY, c.indexY);
                });
                return indexY;
            }
            // nothing found, assume top
            return 0;
        };
        /** does this branch intersect with another when drawn next to each other.
            can this branch be displayed on the same X axis without overlapping? */
        Commit.prototype.intersects = function (other) {
            var otherY = 9999999, thisY = 999999;
            if (this.outOfScope || other.outOfScope)
                return true;
            return this.getOriginIndexY() > other.getTipPlusIndexY() && this.getTipPlusIndexY() < other.getOriginIndexY();
        };
        Commit.prototype.getIndexY = function () {
            return this.indexY;
        };
        Commit.prototype.warn = function (warning) {
            this.warnings.push(warning);
            this.debug(warning);
        };
        Commit.prototype.debug = function (warning) {
            if (console) {
                Logger.debug(warning, this);
            }
        };
        Commit.prototype.getLane = function () {
            if (this.branch != null) {
                return this.branch.commit.branch.lane;
            }
            return null;
        };
        return Commit;
    })();
    Gitline.Commit = Commit;
})(Gitline || (Gitline = {}));
///<reference path="Commit.ts"/>
var Gitline;
(function (Gitline) {
    var Branch = (function () {
        function Branch(refname, commit, specifity) {
            this.ref = refname;
            this.commit = commit;
            this.specifity = specifity;
            this.shortname = refname.split("@")[0];
            this.category = this.shortname.substring(0, this.shortname.lastIndexOf("/"));
        }
        return Branch;
    })();
    Gitline.Branch = Branch;
})(Gitline || (Gitline = {}));

//# sourceMappingURL=gitline.js.map
