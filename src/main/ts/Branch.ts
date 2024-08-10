import { Commit } from "./Commit";

	export class Branch {
		public specifity: number;
		public start: Commit;
		public origin: Commit;
		public category: string;
		public commit: Commit; // Head commit
		public ref: string; // Name of the branch
		public shortname: string; // name without repo
		public lane: number;
		public parent: Branch;
		public anonymous: boolean;


		constructor(refname: string, commit: Commit, specifity: number) {
			this.ref = refname;
			this.commit = commit;
			this.specifity = specifity;
			this.shortname = refname.split("@")[0];
			this.category = this.shortname.substring(0, this.shortname.lastIndexOf("/"));
		}
	}