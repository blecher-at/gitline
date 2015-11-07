/// <reference path="Branch.ts"/>
/// <reference path="Gitline.ts"/>
/// <reference path="CommitView.ts"/>

/** committer or author */
class Identity {
	public image: string; // optional
	
	public constructor (public name: string, public email: string) {
	}
}

class Commit {
	private container: Gitline;

	private warnings: any[] = [];
	private inHeadsRef: Commit[] = [];
	private parents: Commit[] = [];
	private childs: Commit[] = [];
	private siblings: Commit[] = [];
	public outOfScope: boolean = false; // This commit was not part of the logs scope, but is referenced by another commit.
	public merges = { standard: [], anonymous: []};
	private sha: string;
	private ssha: string; // Abbreviated hash
	public subject: string;
	private data: any;
	private indexY: number;

	private maxSpecifity: number;
	public branch: Branch;
	public directparent: Commit;
	public directchild: Commit;
	
	public view : CommitView;
	
	public committer: Identity;
	public author: Identity;
	
	constructor(container: Gitline, data) {
		this.container = container;
		this.data = data;
		
		// reference the data back to the object
		this.data.obj = this;
		
		if(data.inHeads == null) data.inHeads = [];
		if(data.parenthashes == null) data.parenthashes = [];
		if(data.refnames == null) data.refnames = [];
	
		this.sha = data.sha;
		this.ssha = data.ssha;
		this.subject = data.subject;
		this.indexY = container.maxIndexY ++;
		
		this.committer = new Identity(this.data.committername, this.data.committeremail);
		this.author = new Identity(this.data.authorname, this.data.authoremail);
	}
	
	public getShortSha() : string {
		return this.ssha;
	}
	
	public getFullSha() : string {
		return this.sha;
	}
	
	public initRelations() {
		var self = this;
		
		this.data.parenthashes.forEach( hash => {
			var parentCommit = this.container.commits[hash];

			// Create a virtual commit
			if(parentCommit == null) {
				parentCommit = new Commit(this.container,  {sha: hash+Math.random()});
				parentCommit.outOfScope = true;
				self.container.addCommit(parentCommit);
			}

			this.parents.push(parentCommit);
			parentCommit.childs.push(this);
			this.siblings = parentCommit.childs; // this will be overwitten as new childs are found
			
			if(this.parents.length > 0) {
				var dp = this.parents[0];
				this.directparent = dp;
				dp.directchild = this;
			}
		});
		
		this.data.inHeads.forEach(headsha => {
			var commit = this.container.commits[headsha];
			if(this.inHeadsRef.indexOf(commit) === undefined) {
				this.inHeadsRef.push(commit)
			}
		});
		
	}
	
	public initDefaultBranch() {
		var commit: Commit = this;
			
		while(commit != null) {
				
			// GUESSING: The correct branch is usually the one with the least specific name
			if(commit.branch == null || commit.branch.specifity > this.branch.specifity) {
				commit.branch = this.branch;
				//commit.debug("assigning "+this.branch.ref)
			}
			commit.branch.start = commit; // this function will traverse the parents, so the last one will be the first commit
			commit.branch.origin = commit.directparent; // this could be null -> it is outside of the history.
			commit = commit.directparent;
		}
	}
	public initHeadSpecifity() {
		for (var i=0; i<this.data.refnames.length; i++) {
			var refname = this.data.refnames[i];
	
			if(!this.container.config.remoteOnly || refname.indexOf("origin/") == 0) {
				
				if(this.container.config.remoteOnly) {
					refname = refname.replace(/^origin./, '');	
				}
				
				var specifity = refname.replace(/[^\/-]/g, '').length*1000;
				specifity += refname.replace(/[^a-zA-Z0-9-]/, '').length;
				
				this.container.addBranch(refname, this, specifity);
				
				/* assign the most specific head on this tip commit */
				if (this.maxSpecifity == null || specifity < this.maxSpecifity) {
					//console.log("assigning branch", refname, this.sha, this.maxSpecifity, specifity)
					this.maxSpecifity = specifity;
					this.branch = this.container.headsMap[refname];
				}
					
				this.branch.category = this.branch.ref.substring(0, refname.lastIndexOf("/"));
				
				this.initDefaultBranch();
			}
		}
	}
	
	public initMerges() {

		this.merges = { standard: [], anonymous: []};
		this.warnings = [];
		
		// Detect a merge (octopus currently not supported)

		if(this.parents.length == 1) {
			var dp = this.parents[0];
			this.directparent = dp;
			dp.directchild = this;
		}
		
		if(this.parents.length >= 2) {
			var dp = this.parents[0];
			this.directparent = dp;
			dp.directchild = this;

			for(var i = 1 ; i<this.parents.length ; i++) {			
			var mp = this.parents[i];
	
				if(mp != null) {
	
					// Clues if this is a standard or anonymous merge
					if(mp.data.refnames.length > 0 // This is standard merge with mps head
						|| mp.inHeadsRef.length != dp.inHeadsRef.length // The heads of both are different
					) {
						
						this.merges.standard.push({source: mp});
					} else  {
						// This is a anonymous (automatic) merge on the same branch
						this.merges.anonymous.push({source: mp})
						this.initAnonymous();
					}
				}
			}
		}
	}
	
	public initAnonymous() {
		// Create a dummy branch for anonymous merges, which is as specific as the original branch. 
		// try finding the original branch by going up direct childs, which will get the original
		
		var self: Commit = this;
		this.merges.anonymous.forEach(_merge => {
			var merge: Commit = _merge.source
			var child = this;
			
			while(child != null && child.branch == null) {
				child = child.directchild;
			}
				
			/* this is only an anonymous branch head, if there is only one child (the merge) 
			   TODO: if there are multiple, it might result in wrongly assigned branches */ 
			if(child != null && merge.branch == null) {
				merge.branch = new Branch();
				merge.branch.ref = child.branch.ref+"/anonymous"+merge.sha+Math.random();
				merge.branch.anonymous = true;
				merge.branch.commit = merge;
				merge.branch.specifity = child.branch.specifity+1;
				merge.branch.parent = child.branch;
				merge.branch.start =child;
				merge.branch.category = child.branch.category;
				
				this.container.headsMap[merge.branch.ref] = merge.branch;
			}
			
		});
	}
	
	public getColor(lightness: number): string {
		if(this.branch == null) {
			this.warn("No Branch set")
		} else {
			var b = this.branch;
			if(this.branch.anonymous) {
				b = this.branch.parent;
			}
			
			var hue = b.lane * 300/this.container.maxX;
			return "hsl("+hue+", 100%, "+lightness+"%)";
		}
	}
	
	public hasMerges(): boolean {
		return this.merges.standard.length > 0 || this.merges.anonymous.length > 0;
	}
	
	public getX() {
		return indexToX(this.getLane()); 
	}
	
	public getY() {
		if(this.outOfScope) {
			return this.container.rootLabel.offsetTop + 20;
		}
		return this.view.label.offsetTop + 10;
	}
	
	public getOriginIndexY(): number {
		if(this.branch.origin != undefined) {
			return this.branch.origin.getIndexY();
		} else if(this.branch.start.outOfScope){
			return this.container.maxIndexY;
		} else {
			return this.branch.start.indexY;
		}
	}
	
	public intersects(other: Commit): boolean {
		var otherY=9999999, thisY=999999;
		if(this.outOfScope || other.outOfScope) return true;
		
		if(other.directchild != null) {
			otherY = other.directchild.indexY;
		}
		
		if(this.directchild != null) {
			thisY = this.directchild.indexY;
		}
		
		return this.getOriginIndexY() >= Math.min(other.indexY, otherY) && Math.min(thisY, this.indexY) <= other.getOriginIndexY();
	}
	
	public getIndex(): number {
		return this.data.index;
	}
	
	public getIndexY(): number {
		return this.indexY;
	}
	
	public warn(warning: string) {
		this.warnings.push(warning);
		this.debug(warning);
	}
	
	public debug(warning: string) {
		if(console) {
			console.log(warning, this);
		}
	}
		
	public getLane() {
		if(this.branch != null) { // TODO: anonymous branches will get their index from parent ones
			return this.branch.commit.branch.lane;
		}	
		return null;
	}
	

	
}
	
