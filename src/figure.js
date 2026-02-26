import { detectCollision } from "./collision.js";

export default class Figure {
  constructor(x, y, size, canvasBounds) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.canvasBounds = canvasBounds;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.angularVelocity = 0;
    this.type = "base";
    this.collisionCooldown = 0;
    this._boundsBuffer = { left: 0, right: 0, top: 0, bottom: 0 };
  }

  setSpeed(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  setAngularSpeed(omega) {
    this.angularVelocity = omega;
  }

  applyBoundsResponse(bounds) {
    if (bounds.left < 0) {
      this.x += -bounds.left;
      if (this.vx < 0) this.vx *= -1;
    } else if (bounds.right > this.canvasBounds.width) {
      this.x -= bounds.right - this.canvasBounds.width;
      if (this.vx > 0) this.vx *= -1;
    }

    if (bounds.top < 0) {
      this.y += -bounds.top;
      if (this.vy < 0) this.vy *= -1;
    } else if (bounds.bottom > this.canvasBounds.height) {
      this.y -= bounds.bottom - this.canvasBounds.height;
      if (this.vy > 0) this.vy *= -1;
    }
  }

  update(dt) {
    const t = dt / 1000;
    this.x += this.vx * t;
    this.y += this.vy * t;
    this.angle += this.angularVelocity * t;

    this.fillBounds(this._boundsBuffer);
    this.applyBoundsResponse(this._boundsBuffer);

    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
    }
  }

  draw(ctx) { }

  collidesWith(other) {
    return detectCollision(this, other) !== null;
  }

  resolveCollision(other, manifold = null) {
    const computedManifold = manifold || detectCollision(this, other);
    if (!computedManifold) return;

    const nx = computedManifold.normal.x;
    const ny = computedManifold.normal.y;

    const overlap = computedManifold.depth;
    if (overlap > 0) {
      const slop = 0.01;
      const percent = 0.8;
      const correction = Math.max(overlap - slop, 0) * percent * 0.5;
      this.x -= nx * correction;
      this.y -= ny * correction;
      other.x += nx * correction;
      other.y += ny * correction;
    }

    if (this.collisionCooldown > 0 || other.collisionCooldown > 0) return;

    const v1n = this.vx * nx + this.vy * ny;
    const v2n = other.vx * nx + other.vy * ny;

    this.vx += (v2n - v1n) * nx;
    this.vy += (v2n - v1n) * ny;
    other.vx += (v1n - v2n) * nx;
    other.vy += (v1n - v2n) * ny;

    this.collisionCooldown = 2;
    other.collisionCooldown = 2;
  }

  getRadius() {
    return this.size / 2;
  }

  getShapeType() {
    return this.type;
  }

  getWorldVertices() {
    return [];
  }

  getBounds() {
    this.fillBounds(this._boundsBuffer);
  }

  fillBounds(out) {
    throw new Error("fillBounds must be implemented");
  }
}

