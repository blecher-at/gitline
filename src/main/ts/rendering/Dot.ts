import { Shape } from "./Shape";

	export class Dot extends Shape {

		x: number;
		y: number;
		width: number;
		height: number;

		constructor(canvas: any) {
			super(canvas, canvas.createRectangle());
		}

		public size(width: number, height: number): Dot {
			this.width = width;
			this.height = height;

			this.element.setWidth(width);
			this.element.setHeight(height);
			this.element.setXRadius(width / 4);
			this.element.setYRadius(width / 4);

			this.update();
			this.addIfMissing();
			return this;
		}

		public at(x: number, y: number): Dot {
			this.x = x;
			this.y = y;

			this.update();
			this.addIfMissing();
			return this;
		}

		public color(strokeColor: string, fillColor: string): Dot {
			this.element.getStroke().setWeight(1);
			this.element.getStroke().setColor(strokeColor);
			this.element.getFill().setColor(fillColor);
			return this;
		}

		public update() {
			this.element.setLocationXY(this.x - this.width / 2, this.y - this.height / 2);
			super.update();
		}
	}