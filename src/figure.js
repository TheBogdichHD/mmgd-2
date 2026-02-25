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
  }

  setSpeed(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  setAngularSpeed(omega) {
    this.angularVelocity = omega;
  }

  update(dt) {
    const t = dt / 1000;
    this.x += this.vx * t;
    this.y += this.vy * t;
    this.angle += this.angularVelocity * t;

    const bounds = this.getBounds();

    if (bounds.left < 0 || bounds.right > this.canvasBounds.width) {
      this.vx *= -1;
    }
    if (bounds.top < 0 || bounds.bottom > this.canvasBounds.height) {
      this.vy *= -1;
    }

    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
    }
  }

  draw(ctx) {}

  collidesWith(other) {
    const b1 = this.getBounds();
    const b2 = other.getBounds();

    return !(
      b1.right < b2.left ||
      b1.left > b2.right ||
      b1.bottom < b2.top ||
      b1.top > b2.bottom
    );
  }

  resolveCollision(other) {
    if (this.collisionCooldown > 0 || other.collisionCooldown > 0) return;

    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    const nx = dx / distance;
    const ny = dy / distance;

    const v1n = this.vx * nx + this.vy * ny;
    const v2n = other.vx * nx + other.vy * ny;

    this.vx += (v2n - v1n) * nx;
    this.vy += (v2n - v1n) * ny;
    other.vx += (v1n - v2n) * nx;
    other.vy += (v1n - v2n) * ny;

    const rSum = this.getRadius() + other.getRadius();
    const overlap = rSum - distance;
    if (overlap > 0) {
      const separation = Math.min(overlap / 4, 1);
      this.x -= nx * separation;
      this.y -= ny * separation;
      other.x += nx * separation;
      other.y += ny * separation;
    }

    this.collisionCooldown = 5;
    other.collisionCooldown = 5;
  }

  getRadius() {
    return this.size / 2;
  }

  getBounds() {
    throw new Error("getBounds must be implemented");
  }
}
