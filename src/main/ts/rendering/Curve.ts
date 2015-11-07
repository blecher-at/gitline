/// <reference path="BaseLink.ts"/>
/**
 * New typescript file
 */
declare var jsgl: any;
 
class Curve extends BaseLink {
	
	constructor(canvas: any) {
		super(canvas, canvas.createCurve());
	}
	
	public update() {
		var x: number = this.childDot.x;
		var y: number = this.childDot.y;
		var parentX: number = this.parentDot.x;
		var parentY: number = this.parentDot.y;
		var color: string = this.lineColor;

		var direction = x < parentX ? 1 : -1;

		this.element.setStartPointXY(parentX, parentY - this.parentDot.height / 2)
		this.element.setEndPointXY(x+this.childDot.width / 2*direction, y);
		this.element.setControl2PointXY(parentX, y);
		this.element.setControl1PointXY(parentX, y);

		this.element.getStroke().setWeight(1);
		this.element.getStroke().setColor(color);
		
		
		new jsgl.Vector2D(100,50);
		var arrow = this.canvas.createPolygon();
		arrow.addPointXY(0,0);
		arrow.addPointXY(6,-4)
		arrow.addPointXY(6,4)

		arrow.getStroke().setWeight(0)
		arrow.getFill().setColor(color)
		
		// Move					
		for(var i=0;i<arrow.getPointsCount(); i++) {
			var px = arrow.getPointAt(i).getX();
			var py = arrow.getPointAt(i).getY();
			arrow.setPointXYAt(px*direction + x + this.childDot.width / 2*direction, py + y, i);
		}
	}
	
}