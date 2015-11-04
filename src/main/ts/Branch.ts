class Branch {
	public specifity: number;
	public start: Commit;
	public origin: Commit;
	public category: string;
	public commit: Commit; // Head commit
	public ref: string; // Name of the branch
	public lane: number;
	public parent: Branch;
	public anonymous: boolean;
}
	