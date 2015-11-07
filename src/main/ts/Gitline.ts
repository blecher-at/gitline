/// <reference path="Branch.ts"/>
/// <reference path="Commit.ts"/>
/// <reference path="Config.ts"/>
/// <reference path="AsyncLoader.ts"/>
	
interface Commits { [key:string]:Commit; }
interface Branches { [key:string]:Branch; }
	
class Gitline {
	
	self = this;
	public maxX:number = 0;
	public maxIndexY:number = 0;
	public commits:Commits = {};
	public canvas;
	public data;
	public panel;
	public textPanel;
	public headsMap:Branches = {};
	public rootLabel; 
		
	public al: AsyncLoader;
	public config: GitlineConfig = new GitlineConfig();
			
	public addCommit(commit: Commit) {
		this.commits[commit.getFullSha()] = commit;
		
	}
	
	public addBranch(refname: string, commit: Commit, specifity: number) {
		var branch = new Branch();
		branch.ref = refname;
		branch.commit = commit;
		branch.specifity = specifity;
		this.headsMap[refname] = branch;
	}
	
	public render(loadingPanel, panel, textPanel, data) {

		this.data = data;
		this.canvas = new jsgl.Panel(panel);
		this.panel = panel;
		this.textPanel = textPanel;

		var al = this.al = new AsyncLoader(loadingPanel);

		al.then("Loading Commits", () => {return Object.keys(this.data)}, (sha) => {
			var commit = new Commit(this, data[sha]);
			this.addCommit(commit);
		});

		al.then("Calculating Relationships", () => {return Object.keys(this.commits)}, (sha) => {
			var commit = this.commits[sha];
			
			commit.initRelations();
			commit.initHeadSpecifity();
			commit.initMerges();
		});
		
		al.thenSingle("Assigning Branches", () => {
			this.initBranches();
		});

		al.then("Drawing Labels", () => {return Object.keys(this.commits)}, (sha) => {
			var commit = this.commits[sha];
			this.drawCommit(commit);
		});
		
		al.thenSingle("Creating Legend", () => {
			this.rootLabel = document.createElement('div')
			this.rootLabel.className = "commit-legend"
			this.textPanel.appendChild(this.rootLabel);
		});
		
		al.then("Drawing Merges", () => {return Object.keys(this.commits)}, (sha) => {
			var commit = this.commits[sha];
			this.drawReferences(commit);
		});
		
		al.thenSingle("Resizing", () => {
			panel.style.width = indexToX(this.maxX + 1) + "px"
			panel.style.height = this.rootLabel.offsetTop + "px";
		});
		
		al.start();
		
		
		window.onresize = (event: UIEvent) => {
			
			al.then("Redrawing", () => {return Object.keys(this.commits)}, (sha) => {
				var commit:Commit = this.commits[sha];
				commit.view.redraw();
			});
			al.thenSingle("Resizing", () => {
				panel.style.width = indexToX(this.maxX + 1) + "px"
				panel.style.height = this.rootLabel.offsetTop + "px";
			});			
			al.start(false); 
		};
	}
	
	
	public drawCommit(commit: Commit) {
		// Label
		
		if(commit.outOfScope == false) {
			commit.view = new CommitView(this.canvas, this.config, commit);
			var label = commit.view.label = this.drawLabel(commit);
			
			this.textPanel.appendChild(commit.view.label);
			
			var self = this;
			commit.view.label.onclick = function() {
				if(console) {
					console.log(commit);	
				}
			}
			
			commit.view.label.style['padding-left'] = indexToX(this.maxX + 1)+"px"
		}
				

	}
	
	public drawReferences(commit: Commit) {
		commit.view.addRelations();
		commit.view.redraw();
	}
	
	public drawLabel(commit: Commit) {
		var label = document.createElement('div')
		label.className = "commit-legend"

		// SHA Hash 
		var shortSha:string = commit.getShortSha();
		var fullSha:string = commit.getFullSha();
		var sha = document.createElement("span");
		sha.innerHTML = shortSha+" ";
		sha.style.fontFamily = "Courier";
		
		sha.onclick = function (event) {
			if(event.detail == 2) {
				this.innerHTML = fullSha+ " ";
				event.cancelBubble = true;
			}
		};
		sha.onmouseout = function (event) {
			this.innerHTML = shortSha+ " ";
		};		
		label.appendChild(sha);

		// Branch - TODO: Tags and other branches		
		if(commit.branch && commit.branch.commit === commit && !commit.branch.anonymous) {
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
		subject.innerHTML = " "+commit.subject;
		subject.style.color = commit.hasMerges() ? "grey": "black";
		label.appendChild(subject); 
		
		label.style.position = "relative";
		return label;
	}
	
		
	
	/*
		Based on the specifity assign the branches to the commits. if in doubt the commit will be on the most specific branch 
	*/
	public initBranches()   {

		var heads = Object.keys(this.headsMap);
		
		/* set the index to the head object */
		for(var i =0; i< heads.length; i++) {
			var headName = heads[i];
			var head = this.headsMap[headName];
			head.commit.initDefaultBranch();
		}
		
		/* Sort the branches by specifity */
		var self = this;
		heads.sort(function(l, r) {
			var lHead: Commit = self.headsMap[l].commit;
			var rHead: Commit = self.headsMap[r].commit;
			
			if(lHead === rHead) {
				return 0;
			}
			
			if(lHead.branch.category === rHead.branch.category) {
				return lHead.branch.specifity - rHead.branch.specifity;
			} else {
				return lHead.branch.category.length - rHead.branch.category.length;
			}
		});



		/* set the index to the head object */
		var maxLane = 0;
		for(var i =0; i< heads.length; i++) {
			var headName = heads[i];
			var head = this.headsMap[headName];
			var tip: Commit = head.commit;
			
			if(tip.branch === head) {
				head.lane = maxLane;
				maxLane ++;

				var minLane = 0;
				// Can we display this head a little more to the left?
				for(var l=0; l< heads.length; l++) {

					var canUseLane : boolean = true;
					for(var j=0; j< heads.length; j++) {
						var jheadName = heads[j];
						var headOnLane: Commit = this.headsMap[jheadName].commit;
						
						if(headOnLane !== undefined && headOnLane.branch != head && headOnLane.branch.lane === l && (tip.intersects(headOnLane) || tip.branch.category != headOnLane.branch.category)) {
							canUseLane = false;
						}
					}
					
					if(canUseLane) {
						minLane = Math.max(minLane, headOnLane.branch.lane)+1;
						//console.log("NO INTERSECTS: ",tip.branch.ref," - ",headOnLane.branch.ref);
						head.lane = l;
						break;
					}
				}
				
				this.maxX = Math.max(this.maxX, head.lane);
			}

		}
		
	}
}	
