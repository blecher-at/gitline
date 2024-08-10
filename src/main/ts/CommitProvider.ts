	export class CommitProvider {
		private url;
		private callback: Function;
		private errorCallback: Function;

		constructor(url: string) {
			this.url = url;
		}

		public whenDone(data: any) {
			this.callback(data);
		}

		public withErrorCallback(callbackFn: Function) {
			this.errorCallback = callbackFn;
		}

		public withCallback(callbackFn: Function) {
			this.callback = callbackFn;
		}

		/** this method should be overwritten. it must call whenDone(data) when all data was loaded. */
		public onRequested(url: string) {
			throw new Error("onRequested not implemented on " + this);
		}

		public request() {
			this.onRequested(this.url);
		}

		public error(e: any) {
			this.errorCallback(e);
		}
	}