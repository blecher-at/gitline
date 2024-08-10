class AsyncLoadingItem {
    public label: string;
    public data: any;
    public callback: Function;
    public index: number;
    public of: number;

    constructor(label: string, data: any, callback: Function, index: number, of: number) {
        this.label = label;
        this.data = data;
        this.callback = callback;
        this.index = index;
        this.of = of;
    }
}

export class AsyncLoader {
    private element: HTMLElement;
    private queue: (() => Promise<void>)[] = []; // Now storing a queue of functions returning promises.
    private suspended: boolean = false;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    public then(label: string, dataCallback: Function, callback: Function): AsyncLoader {
        // Store the function returning a promise in the queue.
        this.queue.push(() => this.processBatch(label, dataCallback, callback));
        return this;
    }

    public thenSingle(label: string, callback: Function): AsyncLoader {
        // Store the function returning a promise in the queue.
        this.queue.push(() => this.processSingle(label, callback));
        return this;
    }

    private processSingle(label: string, callback: Function): Promise<void> {
        // The showStatus and other synchronous code should be placed outside of the promise constructor.
        const item = new AsyncLoadingItem(label, null, callback, 0, 1);
        this.showStatus(item);

        return new Promise<void>((resolve, reject) => {
            try {
                callback();
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    private processBatch(label: string, dataCallback: Function, itemCallback: Function): Promise<void> {
        const data = dataCallback();
        const promises = data.map((itemData, index) => {
            const item = new AsyncLoadingItem(label, itemData, itemCallback, index, data.length);
            return this.processItem(item, itemCallback);
        });

        return Promise.all(promises).then(() => {});
    }

    private processItem(item: AsyncLoadingItem, itemCallback: Function): Promise<void> {
        this.showStatus(item);

        return new Promise<void>((resolve, reject) => {
            try {
                itemCallback(item.data);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

	private async processQueue(): Promise<void> {
        while (this.queue.length > 0 && !this.suspended) {
            const task = this.queue.shift(); // Get the next task.
            if (task) {
                try {
                    await task();
                } catch (e) {
                    this.error(e);
                    break;
                }
            }
        }
        if (this.queue.length === 0) {
            this.element.hidden = true; // Hide the element when all tasks are done.
        }
    }

    public start(shield: boolean = true): Promise<void> {
        if (shield && this.suspended === false) {
            this.element.hidden = false;
        }
        return this.processQueue();
    }

    public suspend() {
        this.suspended = true;
    }

    public resume() {
        this.suspended = false;
        this.start(false); // Pass 'false' to indicate the element should stay as is.
    }

    public showStatus(item: AsyncLoadingItem) {
        this.element.innerHTML = `${item.label} (${item.index + 1}/${item.of})`;
    }

    public error(e: any) {
        console.error(e);
        this.element.innerHTML = 'Error: ' + e.toString();
        this.suspend();
    }
}
