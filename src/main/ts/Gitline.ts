/// <reference path="Branch.ts"/>
/// <reference path="Commit.ts"/>
/// <reference path="Config.ts"/>
	
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
	
	public render(panel, textPanel, data) {

		this.data = data;
		this.canvas = new jsgl.Panel(panel);
		this.panel = panel;
		this.textPanel = textPanel;

		// Initlialize the data
		for (var sha in this.data) {
			var commit = new Commit(this, data[sha]);
			this.addCommit(commit);
		}
		
	
		for (var sha in this.commits) {
			var commit = this.commits[sha];
			
			commit.initRelations();
			commit.initHeadSpecifity();
			commit.initMerges();
			
		}
		
		this.initBranches();



		for (var sha in this.commits) {
			var commit = this.commits[sha];
			this.drawCommit(commit);
		}
		
		
		this.rootLabel = document.createElement('div')
		this.rootLabel.className = "commit-legend"
		this.textPanel.appendChild(this.rootLabel);
		
		for (var sha in this.commits) {
			var commit = this.commits[sha];
			this.drawReferences(commit);
		}
		
		panel.style.width = indexToX(this.maxX + 1) + "px"
		
	}
	
	
	
	public drawCommit(commit: Commit) {
		// Label
		
		if(commit.outOfScope == false) {
			commit.domLabel = this.drawLabel(commit);
			this.textPanel.appendChild(commit.domLabel);
		
			var lane = commit.getLane();
			if(lane != null) {
				this.drawDot(commit.getX(), commit.getY(), commit.getColor(20), commit.getColor(80));
			} else {
				commit.warn("lane not found")
			}
			var self = this;
			commit.domLabel.onclick = function() {
				console.log(self);
			}
			
			commit.domLabel.style['padding-left'] = indexToX(this.maxX + 1)+"px"
		}
				

	}
	
	public drawReferences(commit: Commit) {
	
		var x = commit.getX();
		var y = commit.getY();
		
		if(commit.directparent != null) {
			var parentX = commit.directparent.getX();
			
			var parentY = commit.directparent.getY();
	
			if(commit.directparent.outOfScope) {
				this.drawStraight(x, y, x, parentY, commit.getColor(20));
			} else		
			if(x == parentX || commit.directparent.outOfScope) {  
				/* direct parent is the same X/lane, this means it is a standard forward commit */
				this.drawStraight(x, y, parentX, parentY, commit.getColor(20));
				
			} else { 
				/* direct parent is on a different lane, this is most certainly a new branch */
				this.drawCreation(x, y, parentX, parentY, commit.getColor(30));
			}
		}
		
		var allmerges = commit.merges.standard.concat(commit.merges.anonymous);
		
		allmerges.forEach( merge => {
			var parentCommit: Commit = merge.source;
			
			var parentX = indexToX(parentCommit.getLane());
			var parentY = parentCommit.getY();
		
			this.drawCurve(x, y, parentX, parentY, parentCommit.getColor(40));
		});
	}
	
	public drawStraight(x: number, y: number, parentX: number, parentY: number, color: string) {
		var l = this.canvas.createLine();
		
		l.setStartPointXY(x, y + this.config.dotRadiusY);
		l.setEndPointXY(parentX, parentY - this.config.dotRadiusY);
		l.getStroke().setWeight(1)
		l.getStroke().setColor(color)
		this.canvas.addElement(l);
	}
	
	public drawCreation(x: number, y: number, parentX: number, parentY: number, color: string) {
					
		var l = this.canvas.createLine();
		
		if(parentX < x) {
			l.setStartPointXY(parentX + this.config.dotRadiusX, parentY)
		} else {
			l.setStartPointXY(parentX - this.config.dotRadiusX, parentY)
		}
		l.setEndPointXY(x, parentY);
		l.getStroke().setWeight(1)
		l.getStroke().setDashStyle(jsgl.DashStyles.DASH); 
		l.getStroke().setColor(color)
		this.canvas.addElement(l);
		
		var l = this.canvas.createLine();
		l.setStartPointXY(x, parentY)
		l.setEndPointXY(x, y + this.config.dotRadiusY);
		l.getStroke().setWeight(1)
		l.getStroke().setColor(color)
		this.canvas.addElement(l);
	}
	
	public drawDot(x: number, y: number, color: string, fillColor: string) {
		var circle = this.canvas.createRectangle();
		var sizeX = this.config.dotWidth;
		var sizeY = this.config.dotHeight;
		
		circle.setLocationXY(x - this.config.dotRadiusX, y - this.config.dotRadiusY)
		circle.setWidth(sizeX)
		circle.setHeight(sizeY)
		circle.setXRadius(sizeX /4)
		circle.setYRadius(sizeX /4)
		circle.getStroke().setWeight(1)
		circle.getStroke().setColor(color)
		circle.getFill().setColor(fillColor)
		this.canvas.addElement(circle);
	}
	
	public drawCurve(x: number, y: number, parentX: number, parentY: number, color: string) {
				// Merge
				var l = this.canvas.createCurve();
				
				var direction = x < parentX ? 1 : -1;

				l.setStartPointXY(parentX, parentY - this.config.dotRadiusY)
				l.setEndPointXY(x+this.config.dotRadiusX*direction, y);
				l.setControl2PointXY(parentX, y)
				l.setControl1PointXY(parentX, y)

				l.getStroke().setWeight(1)
				l.getStroke().setColor(color)
				this.canvas.addElement(l);
				
				
				new jsgl.Vector2D(100,50);
				var arrow = this.canvas.createPolygon();
				arrow.addPointXY(0,0);
				arrow.addPointXY(6,-4)
				arrow.addPointXY(6,4)

				arrow.getStroke().setWeight(0)
				arrow.getFill().setColor(color)
				
				// Move					
				for(var i=0;i<arrow.getPointsCount(); i++) {
					var px = arrow.getPointAt(i).getX();
					var py = arrow.getPointAt(i).getY();
					arrow.setPointXYAt(px*direction + x + this.config.dotRadiusX*direction, py + y, i);
				}
				this.canvas.addElement(arrow);
				
				
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
		if(commit.branch && commit.branch.commit === commit) {
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
		subject.innerHTML = commit.subject;
		subject.style.color = "grey"
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
			
			//head.index = i;
			
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
						console.log("NO INTERSECTS: ",tip.branch.ref," - ",headOnLane.branch.ref);
						head.lane = l;
						break;
					}
				}
				
				this.maxX = Math.max(this.maxX, head.lane);
			}

		}
		
	}
}	
