export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type Point2D = Vector2D;
export type Point3D = Vector3D;

export interface Size2D {
  width: number;
  height: number;
}

export interface Size3D extends Size2D {
  depth: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Box extends Rect {
  z: number;
  depth: number;
}
