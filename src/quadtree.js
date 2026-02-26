function intersects(a, b) {
    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
    );
}

function contains(outer, inner) {
    return (
        inner.left >= outer.left &&
        inner.right <= outer.right &&
        inner.top >= outer.top &&
        inner.bottom <= outer.bottom
    );
}

class Node {
    constructor(bounds, depth, maxDepth, capacity) {
        this.bounds = bounds;
        this.depth = depth;
        this.maxDepth = maxDepth;
        this.capacity = capacity;
        this.items = [];
        this.children = null;
    }

    subdivide() {
        const halfWidth = (this.bounds.right - this.bounds.left) / 2;
        const halfHeight = (this.bounds.bottom - this.bounds.top) / 2;
        const left = this.bounds.left;
        const top = this.bounds.top;

        this.children = [
            new Node(
                {
                    left,
                    top,
                    right: left + halfWidth,
                    bottom: top + halfHeight,
                },
                this.depth + 1,
                this.maxDepth,
                this.capacity,
            ),
            new Node(
                {
                    left: left + halfWidth,
                    top,
                    right: left + halfWidth * 2,
                    bottom: top + halfHeight,
                },
                this.depth + 1,
                this.maxDepth,
                this.capacity,
            ),
            new Node(
                {
                    left,
                    top: top + halfHeight,
                    right: left + halfWidth,
                    bottom: top + halfHeight * 2,
                },
                this.depth + 1,
                this.maxDepth,
                this.capacity,
            ),
            new Node(
                {
                    left: left + halfWidth,
                    top: top + halfHeight,
                    right: left + halfWidth * 2,
                    bottom: top + halfHeight * 2,
                },
                this.depth + 1,
                this.maxDepth,
                this.capacity,
            ),
        ];
    }

    insert(item) {
        if (!intersects(this.bounds, item.bounds)) {
            return false;
        }

        if (!this.children) {
            this.items.push(item);

            if (this.items.length > this.capacity && this.depth < this.maxDepth) {
                this.subdivide();
                const retained = [];

                for (const storedItem of this.items) {
                    let moved = false;

                    for (const child of this.children) {
                        if (contains(child.bounds, storedItem.bounds)) {
                            child.insert(storedItem);
                            moved = true;
                            break;
                        }
                    }

                    if (!moved) {
                        retained.push(storedItem);
                    }
                }

                this.items = retained;
            }

            return true;
        }

        for (const child of this.children) {
            if (contains(child.bounds, item.bounds)) {
                return child.insert(item);
            }
        }

        this.items.push(item);
        return true;
    }

    query(range, out) {
        if (!intersects(this.bounds, range)) {
            return;
        }

        for (const item of this.items) {
            if (intersects(item.bounds, range)) {
                out.push(item);
            }
        }

        if (!this.children) {
            return;
        }

        for (const child of this.children) {
            child.query(range, out);
        }
    }

    clear() {
        this.items = [];
        if (!this.children) {
            return;
        }

        for (const child of this.children) {
            child.clear();
        }

        this.children = null;
    }
}

export default class Quadtree {
    constructor(bounds, { maxDepth = 7, capacity = 12 } = {}) {
        this.root = new Node(bounds, 0, maxDepth, capacity);
    }

    clear() {
        this.root.clear();
    }

    insert(item) {
        this.root.insert(item);
    }

    rebuild(items) {
        this.clear();
        for (let i = 0; i < items.length; i++) {
            this.insert(items[i]);
        }
    }

    query(range, out = []) {
        out.length = 0;
        this.root.query(range, out);
        return out;
    }
}
