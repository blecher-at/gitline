import { AsyncLoader } from "./AsyncLoader";
import { Branch } from "./Branch";
import { Commit, Identity } from "./Commit";
import { CommitProvider } from "./CommitProvider";
import { CommitView } from "./CommitView";
import { Config, indexToX } from "./Config";
import { Expandable, HTMLExpandableElement } from "./Expandable";
import { GithubCommitProvider } from "./plugins/GithubCommitProvider";
import { LocalGit2JsonProvider } from "./plugins/LocalGit2JsonProvider";

declare var jsgl: any;

interface Commits {
  [key: string]: Commit;
}

interface Branches {
  [key: string]: Branch;
}

export default class Gitline {
  public maxX: number = 0;
  public maxIndexY: number = 0;
  public commits: Commits = {};
  public firstCommit: Commit;
  public canvas;
  public data;
  public panel;
  public textPanel;
  public headsMap: Branches = {};
  public rootLabel;

  public al: AsyncLoader;

  public config: Config = new Config();

  // HTML stuff
  private loadingPanel: HTMLElement;
  private graphicalPanel: HTMLElement;
  private headerPanel: HTMLElement;
  private contentPanel: HTMLElement;

  private commitProvider: CommitProvider;

  static create() {
    return new Gitline();
  }

  public addCommit(commit: Commit) {
    this.commits[commit.getFullSha()] = commit;

    // first commit needed by rendering
    if (this.firstCommit === undefined) {
      this.firstCommit = commit;
    }
  }

  public addBranch(refname: string, commit: Commit, specifity: number) {
    this.headsMap[refname] = new Branch(refname, commit, specifity);
  }

  public render() {
    this.canvas = new jsgl.Panel(this.graphicalPanel);

    this.al
      .thenSingle("Loading Data", () => {
        return new Promise((resolve, reject) => {
          this.al.suspend();
          this.commitProvider.withCallback((json) => {
            this.data = json;
            this.al.resume();
            resolve(null);
          });
    
          this.commitProvider.withErrorCallback((error) => {
            this.al.error(error);
            reject(error);
          });
    
          this.commitProvider.request();
        });
      })
      .then(
        "Loading Commits",
        () => {
          return Object.keys(this.data);
        },
        (sha) => {
          var commit = new Commit(this, this.data[sha]);
          this.addCommit(commit);
        }
      )
      .thenSingle("Building Graph", () => {
        this.buildGraph();
      })
      .then(
        "Drawing Labels",
        () => {
          return Object.keys(this.commits);
        },
        (sha) => {
          var commit = this.commits[sha];
          this.drawCommit(commit);
        }
      )
      .thenSingle("Creating Legend", () => {
        this.rootLabel = document.createElement("div");
        this.rootLabel.className = "commit-legend";
        this.textPanel.appendChild(this.rootLabel);
      })
      .then(
        "Drawing Merges",
        () => {
          return Object.keys(this.commits);
        },
        (sha) => {
          var commit = this.commits[sha];
          this.drawReferences(commit);
        }
      )
      .thenSingle("Resizing", () => {
        this.graphicalPanel.style.width = indexToX(this.maxX + 1) + "px";
        this.graphicalPanel.style.height = this.getHeight() + "px";
      })
      .start();

    window.onresize = () => {
      this.al
        .then(
          "Redrawing",
          () => {
            return Object.keys(this.commits);
          },
          (sha) => {
            var commit: Commit = this.commits[sha];
            commit.view.redraw();
          }
        )
        .thenSingle("Resizing", () => {
          this.graphicalPanel.style.width = indexToX(this.maxX + 1) + "px";
          this.graphicalPanel.style.height = this.getHeight() + "px";
        })
        .start(false);
    };
  }

  public getHeight() {
    return this.rootLabel.offsetTop - this.firstCommit.view.label.offsetTop;
  }

  public buildGraph() {
    var shas = Object.keys(this.commits);
    shas.forEach((sha) => {
      var commit = this.commits[sha];
      commit.initRelations();
    });
    shas.forEach((sha) => {
      var commit = this.commits[sha];

      commit.initHeadSpecifity();
      commit.initMerges();
    });
    this.initBranches();
  }

  public drawCommit(commit: Commit) {
    // Label
    commit.view = new CommitView(this.canvas, this.config, commit);

    if (commit.outOfScope === false) {
      commit.view.label = this.drawLabel(commit);

      commit.view.label.onclick = function () {
        if (console) {
          console.debug(commit);
        }
      };

      this.textPanel.appendChild(commit.view.label);
      commit.view.label.style["padding-left"] =
        indexToX(this.maxX + 1) + "px";
    }
  }

  public drawReferences(commit: Commit) {
    commit.view.addRelations();
    commit.view.redraw();
  }

  public drawLabel(commit: Commit) {
    var label = document.createElement("gitline-legend");

    // SHA Hash
    var shortSha: string = commit.getShortSha().trim();
    var fullSha: string = commit.getFullSha().trim();
    var sha: HTMLExpandableElement = Expandable.extend(
      document.createElement("gitline-sha")
    );
    sha.setAttribute("title", fullSha);
    sha.whenShort(shortSha);
    sha.whenFull(fullSha);

    label.appendChild(sha);

    // Author and committer
    label.appendChild(this.drawIdentity("author", commit.author));

    if (commit.author.email != commit.committer.email) {
      label.appendChild(this.drawIdentity("committer", commit.committer));
    }

    // Branch - TODO: Tags and other branches
    if (
      commit.branch &&
      commit.branch.commit === commit &&
      !commit.branch.anonymous
    ) {
      var head: HTMLExpandableElement = Expandable.extend(
        document.createElement("gitline-ref")
      );
      head.style.backgroundColor = commit.getColor(40);
      head.whenShort(commit.branch.ref);
      head.whenFull(commit.branch.ref);

      label.appendChild(head);
    }

    // Subject
    var subject = document.createElement("gitline-subject");
    subject.innerHTML = commit.subject;
    if (commit.hasMerges()) {
      subject.classList.add("has-merges");
    }
    label.appendChild(subject);

    return label;
  }

  private drawIdentity(type: string, id: Identity): HTMLElement {
    var container: HTMLElement = document.createElement(
      "gitline-identity-container"
    );

    var identity: HTMLExpandableElement = Expandable.extend(
      document.createElement("gitline-identity")
    );
    identity.classList.add(type);
    var fullname = id.name + " &lt;" + id.email.toLowerCase() + "&gt;";
    identity.setAttribute(
      "title",
      id.name + " <" + id.email.toLowerCase() + ">"
    );
    identity.style.background = this.config.avatars
      .map((f) => {
        return "url(" + f(id.email) + ") no-repeat left center";
      })
      .join(", ");
    identity.whenFull(fullname);
    identity.whenShort("");

    var datetime: HTMLExpandableElement = Expandable.extend(
      document.createElement("gitline-identity-datetime")
    );
    datetime.classList.add(type + "-datetime");
    var fullDate = id.date.toISOString().slice(0, 16).replace('T',' ')
    datetime.setAttribute("title", fullDate);
    datetime.whenFull(fullDate);
    datetime.whenShort(id.date.toISOString().slice(11, 16));

    container.appendChild(identity);
    container.appendChild(datetime);

    return container;
  }

  /*
		 Based on the specifity assign the branches to the commits. if in doubt the commit will be on the most specific branch
		 */
  public initBranches() {
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
      var lHead: Commit = self.headsMap[l].commit;
      var rHead: Commit = self.headsMap[r].commit;

      if (lHead === rHead) {
        return 0;
      }

      if (lHead.branch.category === rHead.branch.category) {
        return lHead.branch.specifity - rHead.branch.specifity;
      } else {
        return lHead.branch.category.length - rHead.branch.category.length;
      }
    });

    /* set the index to the head object */
    var maxLane = 0;
    for (var i = 0; i < heads.length; i++) {
      var headName = heads[i];
      var head = this.headsMap[headName];
      var tip: Commit = head.commit;

      if (tip.branch === head) {
        head.lane = maxLane;
        //head.index = maxLane;
        maxLane++;

        // Can we display this head a little more to the left?
        for (var l = 0; l < heads.length; l++) {
          var canUseLane: boolean = true;
          for (var j = 0; j < heads.length; j++) {
            var jheadName = heads[j];
            var headOnLane: Commit = this.headsMap[jheadName].commit;

            if (
              headOnLane === undefined ||
              (headOnLane.branch != head &&
                headOnLane.branch.lane === l &&
                (tip.intersects(headOnLane) ||
                  tip.branch.category != headOnLane.branch.category))
            ) {
              canUseLane = false;
            }
          }

          if (canUseLane) {
            console.debug(
              "NO INTERSECTS: ",
              tip.branch.ref,
              " - ",
              headOnLane.branch.ref
            );
            head.lane = l;
            break;
          }
        }

        this.maxX = Math.max(this.maxX, head.lane);
      }
    }
  }

  // Launching
  public fromJSON(jsonFile: string): Gitline {
    return this.fromProvider(new LocalGit2JsonProvider(jsonFile));
  }

  public fromGitHub(url: string, limit: number, accessToken: string): Gitline {
    return this.fromProvider(new GithubCommitProvider(url, limit, accessToken));
  }

  public fromProvider(commitProvider: CommitProvider): Gitline {
    this.commitProvider = commitProvider;
    return this;
  }

  private renderTo(panel: HTMLElement): Gitline {
    if (this.headerPanel !== undefined) {
      panel.appendChild(this.headerPanel);
    }
    panel.appendChild(
      (this.loadingPanel = document.createElement("gitline-loadingpanel"))
    );
    panel.appendChild(
      (this.contentPanel = document.createElement("gitline-contentpanel"))
    );
    this.contentPanel.appendChild(
      (this.graphicalPanel = document.createElement("gitline-graphicalpanel"))
    );
    this.contentPanel.appendChild(
      (this.textPanel = document.createElement("gitline-textpanel"))
    );
    this.al = new AsyncLoader(this.loadingPanel);

    this.render();
    return this;
  }

  public withHeader(header: string): Gitline;
  public withHeader(header: HTMLElement): Gitline;

  public withHeader(header: any) {
    if (typeof header === "string") {
      this.headerPanel = document.createElement("gitline-headerpanel");
      this.headerPanel.innerHTML = header;
    } else {
      this.headerPanel = header;
    }

    return this;
  }
}
