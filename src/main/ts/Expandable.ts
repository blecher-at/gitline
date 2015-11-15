module Gitline {
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
				extended.onclick = (event) => {
					extended.innerHTML = innerHTML;
					event.cancelBubble = true;
					element.classList.add("gitline-expandable-expanded");
				};
			};

			extended.whenShort = (innerHTML: string) => {
				extended.innerHTML = innerHTML;
				extended.onmouseout = () => {
					extended.innerHTML = innerHTML + " ";
					element.classList.remove("gitline-expandable-expanded");
				};
			};

			return extended;
		}
	}
}