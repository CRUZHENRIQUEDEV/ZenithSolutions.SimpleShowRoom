// core/src/types/index.ts
// Tipos básicos do sistema
export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Vector2D {
  dx: number;
  dy: number;
}

export interface Vector3D extends Vector2D {
  dz: number;
}

// Tipos de estado e configuração
export interface ViewportConfig {
  dimensions: Dimensions;
  scale: number;
  center: Point2D;
}

export interface SystemConfig {
  debug: boolean;
  performanceMode: "quality" | "balanced" | "performance";
}
