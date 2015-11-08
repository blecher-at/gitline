/**
 * New typescript file
 */

class CommitProvider {
 	private url;
 	private callback: Function;
 	
	constructor (url: string) {
		this.url = url;
		this.onRequested(this.url);
	}
	
	public whenDone(data: any) {
		this.callback(data);
	}
	
	public withCallback(callbackFn: Function) {
		this.callback = callbackFn;
	}
	
	/** this method should be overwritten. it must call whenDone(data) when all data was loaded. */
	public onRequested(url: string) {
		throw new Error("onRequested not implemented on "+this);
	}
}
	