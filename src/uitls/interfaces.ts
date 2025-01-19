export type PointDataIf = {
  number: number;
  longitude: number;
  latitude: number;
  distanceFromPrevious: number | null;
  type: "LINE" | "POLY";
};
