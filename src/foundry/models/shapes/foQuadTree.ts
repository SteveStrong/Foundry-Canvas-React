
export interface XY {
  x: number;
  y: number;
}

interface AABB {
  center: XY;
  halfDimension: number;
  containsPoint(point: XY): boolean;
  intersectsAABB(other: AABB): boolean;
}

export class foBoundingBox implements AABB {
  center: XY;
  halfDimension: number;

  constructor(center: XY, halfDimension: number) {
    this.center = center;
    this.halfDimension = halfDimension;
  }

  containsPoint(point: XY): boolean {
    if (point.x < this.center.x - this.halfDimension) {
      return false;
    }
    if (point.y < this.center.y - this.halfDimension) {
      return false;
    }
    if (point.x > this.center.x + this.halfDimension) {
      return false;
    }
    if (point.y > this.center.y + this.halfDimension) {
      return false;
    }
    return true;
  }

  intersectsAABB(other: AABB): boolean {
    if ( other.center.x + other.halfDimension < this.center.x - this.halfDimension ) {
      return false;
    }

    if ( other.center.y + other.halfDimension < this.center.y - this.halfDimension ) {
      return false;
    }

    if ( other.center.x - other.halfDimension > this.center.x + this.halfDimension ) {
      return false;
    }

    if ( other.center.y - other.halfDimension > this.center.y + this.halfDimension ) {
      return false;
    }

    return true;
  }
}

export class foQuadTree {
  QT_NODE_CAPACITY: number = 4;
  boundary: foBoundingBox;

  points: Array<XY> = [];

  northWest: foQuadTree;
  northEast: foQuadTree;
  southWest: foQuadTree;
  southEast: foQuadTree;

  constructor(boundary: foBoundingBox) {
    this.boundary = boundary;
  }

  isLeaf(): boolean {
    return !!!this.northWest;
  }

  insert(p: XY): boolean {
    if (!this.boundary.containsPoint(p)) {
      return false;
    }


    if (this.points && this.points.length < this.QT_NODE_CAPACITY) {
      this.points.push(p);
      return true;
    }
    if (this.isLeaf()) {
      this.subdivide();
    }

    return (
      this.northWest.insert(p) ||
      this.northEast.insert(p) ||
      this.southWest.insert(p) ||
      this.southEast.insert(p)
    );
  }

  subdivide(): void {
    let box: foBoundingBox;
    let newBoundary: number = this.boundary.halfDimension / 2;
    box = new foBoundingBox(
      {
        x: this.boundary.center.x - newBoundary,
        y: this.boundary.center.y + newBoundary
      },
      newBoundary
    );
    this.northWest = new foQuadTree(box);

    box = new foBoundingBox(
      {
        x: this.boundary.center.x + newBoundary,
        y: this.boundary.center.y + newBoundary
      },
      newBoundary
    );
    this.northEast = new foQuadTree(box);

    box = new foBoundingBox(
      {
        x: this.boundary.center.x - newBoundary,
        y: this.boundary.center.y - newBoundary
      },
      newBoundary
    );
    this.southWest = new foQuadTree(box);

    box = new foBoundingBox(
      {
        x: this.boundary.center.x + newBoundary,
        y: this.boundary.center.y - newBoundary
      },
      newBoundary
    );
    this.southEast = new foQuadTree(box);

    this.points.forEach((point: XY) => {
      this.northWest.insert(point) ||
        this.northEast.insert(point) ||
        this.southEast.insert(point) ||
        this.southWest.insert(point);
    });
    this.points = null;
  }

  queryRange(range: foBoundingBox): Array<XY> {
    let pointsInRange: Array<XY> = [];

    if (!this.boundary.intersectsAABB(range)) {
      return pointsInRange;
    }

    pointsInRange = this.points
      ? this.points.filter((point: XY) => range.containsPoint(point))
      : [];
    if (this.isLeaf()) {
      return pointsInRange;
    }
    pointsInRange.push(...this.northWest.queryRange(range));
    pointsInRange.push(...this.northEast.queryRange(range));
    pointsInRange.push(...this.southWest.queryRange(range));
    pointsInRange.push(...this.southEast.queryRange(range));
    return pointsInRange;
  }
}
