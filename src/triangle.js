import Figure from "./figure.js";

export default class Triangle extends Figure {
  constructor(x, y, size, canvasBounds) {
    super(x, y, size, canvasBounds);
    this.size = Number(size) / 2;
    this.type = "triangle";
    this._height = Math.sqrt(3) * this.size;
    this._worldVertices = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const h = this._height;

    ctx.fillStyle = "#10b981";

    ctx.beginPath();
    ctx.moveTo(0, (-h / 3) * 2);
    ctx.lineTo(-this.size, h / 3);
    ctx.lineTo(this.size, h / 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  getRadius() {
    const h = this._height;
    return (h * 2) / 3;
  }

  getWorldVertices() {
    const h = this._height;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const topY = (-h / 3) * 2;
    const baseY = h / 3;

    const vertices = this._worldVertices;

    vertices[0].x = this.x + 0 * cos - topY * sin;
    vertices[0].y = this.y + 0 * sin + topY * cos;

    vertices[1].x = this.x + (-this.size) * cos - baseY * sin;
    vertices[1].y = this.y + (-this.size) * sin + baseY * cos;

    vertices[2].x = this.x + this.size * cos - baseY * sin;
    vertices[2].y = this.y + this.size * sin + baseY * cos;

    return vertices;
  }

  fillBounds(out) {
    const vertices = this.getWorldVertices();

    let minX = vertices[0].x;
    let maxX = vertices[0].x;
    let minY = vertices[0].y;
    let maxY = vertices[0].y;

    for (let i = 1; i < vertices.length; i++) {
      const vertex = vertices[i];
      if (vertex.x < minX) minX = vertex.x;
      if (vertex.x > maxX) maxX = vertex.x;
      if (vertex.y < minY) minY = vertex.y;
      if (vertex.y > maxY) maxY = vertex.y;
    }

    out.left = minX;
    out.right = maxX;
    out.top = minY;
    out.bottom = maxY;
  }
}
