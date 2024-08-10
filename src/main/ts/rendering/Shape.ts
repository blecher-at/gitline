/**
 * basic support for jsgl shapes
 */
export class Shape {
  protected element: any; // jsgl element
  private renderedTo: HTMLElement; // jsgl canvas (any html)
  protected canvas: any;
  private dependencies: Shape[] = [];

  public constructor(canvas: any, element: any) {
    this.canvas = canvas;
    this.element = element;
  }

  public addIfMissing() {
    if (this.element !== undefined && this.renderedTo == null) {
      this.addElements();
      this.renderedTo = this.canvas;
    }
  }

  public addElements() {
    this.canvas.addElement(this.element);
  }

  public update() {
    this.dependencies.forEach((dep) => {
      dep.update();
    });
  }

  public dependsOn(on: Shape) {
    on.dependencies.push(this);
  }
}
