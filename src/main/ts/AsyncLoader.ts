
class AsyncLoadingItem {
	public label: string;
	public data: any;
	public callback: Function;
	public index: number;
	public of : number;
	
	constructor (label: string, data: any, callback: Function, index: number, of: number) {
		this.label = label;
		this.data = data;
		this.callback = callback;
		this.index = index;
		this.of = of;
	}
}

class AsyncLoader {
	
	private element: HTMLElement;
	private items: AsyncLoadingItem[] = [];

	constructor (element: HTMLElement) {
		this.element = element;
	}
	
	/** do this async, display the label and the data */
	public then(label: string, datacallback: Function, callback: Function) {
		this.thenSingle(label, () => {
			// add it to the beginning of the queue
			var data: any[] = datacallback();
			for(var i = data.length-1; i>= 0; i--) {
				this.items.unshift(new AsyncLoadingItem(label, data[i], callback, i, data.length));	
			}
		});
	}
	
	public thenSingle(label: string, callback: Function) {
		this.items.push(new AsyncLoadingItem(label, null, callback, 1, 1));	
	}
	
	public start(shield: boolean = true) {
		if(shield) {
			this.element.hidden = false;	
		}
		this.next();
	}
	
	public next() {
		var nextItem: AsyncLoadingItem = this.items.shift();
		if(nextItem !== undefined) {
            // avoid yielding control unnecessarily, but limit stack depth at the same time
			if ((nextItem.index % 50) === 0) {
				this.showStatus(nextItem);
	    		window.setTimeout(() => {
                    //console.log("executing "+nextItem.label+ " ("+nextItem.index+"/"+nextItem.of+")");
                    this.execute(nextItem);
                }, 0);
            } else {
                this.execute(nextItem);
            }
		} else {
			this.element.hidden = true;
		}
	}
	
	public showStatus(item: AsyncLoadingItem) {
		this.element.innerHTML = item.label; // + " ("+item.index + "/"+item.of+")";
	}
	
	public execute(item: AsyncLoadingItem) {
		item.callback(item.data);
		this.next();
	}
}
