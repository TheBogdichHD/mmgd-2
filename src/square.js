import Figure from "./figure.js";

export default class Square extends Figure {
  constructor(x, y, size, canvasBounds) {
    super(x, y, size, canvasBounds);
    this.size = Number(size);
    this.halfSize = this.size / 2;
    this.type = "square";
    this._worldVertices = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = "#3b82f6";

    ctx.fillRect(-this.halfSize, -this.halfSize, this.size, this.size);

    ctx.restore();
  }

  getRadius() {
    return this.halfSize * Math.SQRT2;
  }

  getWorldVertices() {
    const h = this.halfSize;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    const vertices = this._worldVertices;

    vertices[0].x = this.x + (-h) * cos - (-h) * sin;
    vertices[0].y = this.y + (-h) * sin + (-h) * cos;

    vertices[1].x = this.x + h * cos - (-h) * sin;
    vertices[1].y = this.y + h * sin + (-h) * cos;

    vertices[2].x = this.x + h * cos - h * sin;
    vertices[2].y = this.y + h * sin + h * cos;

    vertices[3].x = this.x + (-h) * cos - h * sin;
    vertices[3].y = this.y + (-h) * sin + h * cos;

    return vertices;
  }

  fillBounds(out) {
    const absCos = Math.abs(Math.cos(this.angle));
    const absSin = Math.abs(Math.sin(this.angle));
    const extentX = this.halfSize * (absCos + absSin);
    const extentY = extentX;

    out.left = this.x - extentX;
    out.right = this.x + extentX;
    out.top = this.y - extentY;
    out.bottom = this.y + extentY;
  }
}
