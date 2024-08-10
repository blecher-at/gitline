	export interface HTMLExpandableElement extends HTMLElement {
		whenShort(innerHTML: string): void;
		whenFull(innerHTML: string): void;
	}

	/**
	 * Elements with two contents, that expand on double click
	 */
	export class Expandable {
		public static extend(element: HTMLElement): HTMLExpandableElement {
			var extended: HTMLExpandableElement = <HTMLExpandableElement> element;
			element.classList.add("gitline-expandable");

			extended.whenFull = (innerHTML: string) => {
				extended.onclick = () => {
					extended.innerHTML = innerHTML;
					
					element.classList.add("gitline-expandable-expanded");
					Expandable.selectElementText(element);
				};
			};

			extended.whenShort = (innerHTML: string) => {
				extended.innerHTML = innerHTML;
				extended.onmouseout = () => {
					// Delay hiding it
					window.setTimeout (() => {
						extended.innerHTML = innerHTML;
						element.classList.remove("gitline-expandable-expanded");
					}, 1000);
				};
			};

			return extended;
		}

		// x-browser text select
		// http://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
		private static selectElementText(el: HTMLElement): void {
			var doc = window.document, sel, range;
			if (window.getSelection && doc.createRange) {
				sel = window.getSelection();
				range = doc.createRange();
				range.selectNodeContents(el);
				sel.removeAllRanges();
				sel.addRange(range);
			} else if ((<any> doc.body).createTextRange) {
				range = (<any> doc.body).createTextRange();
				range.moveToElementText(el);
				range.select();
			}
		}
	}