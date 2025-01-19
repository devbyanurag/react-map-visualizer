export type PointDataIf = {
  number: number;
  longitude: number;
  latitude: number;
  distanceFromPrevious: number | null;
  type: "LINE" | "POLY";
};

export type ActiveEnterPointsIf = {
  line: boolean;
  poly: boolean;
};
export type PolygonDataIf = {
  type: "POLYGON";
  number: number;
  points: PointDataIf[]; // Array of points representing the polygon
};
export type MissionPointIf = PointDataIf | PolygonDataIf;