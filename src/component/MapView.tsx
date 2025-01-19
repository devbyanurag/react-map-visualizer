import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, MapBrowserEvent, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point, LineString } from "ol/geom";
import { Feature } from "ol";
import { Style, Circle, Fill, Stroke, Text } from "ol/style";
import { fromLonLat, transform } from "ol/proj";
import { getDistance } from "ol/sphere";
import MissionCreation from "./MissionCreation";
import PolygonCreation from "./PolygonCreation";
import BottomControls from "./BottomControls";


type PointData = {
  number: number;
  longitude: number;
  latitude: number;
  distanceFromPrevious: number | null;
};

const MapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const pointsSourceRef = useRef<VectorSource | null>(null);
  const linesSourceRef = useRef<VectorSource | null>(null);
  const [points, setPoints] = useState<PointData[]>([]);
  const [modalLine, setModalLine] = useState<boolean>(true);
  const [modalPoly, setModalPoly] = useState<boolean>(false);
  // const [polyPoints, setPolyPoints] = useState<PointData[]>([]);

  
  const mapObjRef = useRef<Map | null>(null);
  const lastPointRef = useRef<Feature | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    pointsSourceRef.current = new VectorSource();
    linesSourceRef.current = new VectorSource();

    const pointsLayer = new VectorLayer({
      source: pointsSourceRef.current,
      style: (feature) => {
        const pointNumber = feature.get("pointNumber") as number;

        // Green color for first point and current last point
        const color =
          pointNumber === 1 || feature === lastPointRef.current
            ? "green"
            : "blue";

        return new Style({
          image: new Circle({
            radius: 3,
            fill: new Fill({ color }),
          }),
        });
      },
    });

    const linesLayer = new VectorLayer({
      source: linesSourceRef.current,
      style: (feature) => {
        const geometry = feature.getGeometry() as LineString;
        const coordinates = geometry.getCoordinates();

        const startX = coordinates[0][0];
        const startY = coordinates[0][1];
        const endX = coordinates[1][0];
        const endY = coordinates[1][1];

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        const dx = endX - startX;
        const dy = endY - startY;
        const rotation = Math.atan2(-dy, dx);

        return [
          new Style({
            stroke: new Stroke({
              color: "#0066cc",
              width: 2,
            }),
          }),
          new Style({
            text: new Text({
              text: ">",
              font: "20px sans-serif",
              fill: new Fill({ color: "#0066cc" }),
              rotation,
              textAlign: "center",
              offsetX: 0,
              offsetY: 1.45,
            }),
            geometry: new Point([midX, midY]),
          }),
        ];
      },
    });

    mapObjRef.current = new Map({
      view: new View({
        center: fromLonLat([80, 20]),
        zoom: 15,
      }),
      layers: [new TileLayer({ source: new OSM() }), linesLayer, pointsLayer],
    });

    mapObjRef.current.setTarget(mapRef.current);

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.setTarget(undefined);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapObjRef.current) return;

    const handleClick = (event: MapBrowserEvent<UIEvent>) => {
      event.stopPropagation();
      if (!modalLine) return;

      const clickedCoord = event.coordinate;
      const lonLat = transform(clickedCoord, "EPSG:3857", "EPSG:4326");

      setPoints((prevPoints) => {
        const pointNumber = prevPoints.length + 1;
        let distanceFromPrevious: number | null = null;

        const point = new Feature({
          geometry: new Point(clickedCoord),
          label: `Point ${pointNumber}`,
          pointNumber,
        });

        // Update the last point reference
        if (lastPointRef.current) {
          lastPointRef.current.changed(); // Trigger style refresh for previous last point
        }
        lastPointRef.current = point;

        pointsSourceRef.current!.addFeature(point);

        if (prevPoints.length > 0) {
          const prevPoint = prevPoints[prevPoints.length - 1];
          const prevCoord = transform(
            [prevPoint.longitude, prevPoint.latitude],
            "EPSG:4326",
            "EPSG:3857"
          );

          const line = new Feature({
            geometry: new LineString([prevCoord, clickedCoord]),
          });
          linesSourceRef.current!.addFeature(line);

          distanceFromPrevious = getDistance(
            [prevPoint.longitude, prevPoint.latitude],
            [lonLat[0], lonLat[1]]
          );
        }

        // Trigger a style refresh for all points
        pointsSourceRef.current!.getFeatures().forEach((f) => {
          f.changed();
        });

        return [
          ...prevPoints,
          {
            number: pointNumber,
            longitude: lonLat[0],
            latitude: lonLat[1],
            distanceFromPrevious,
          },
        ];
      });
    };

    mapObjRef.current.on("click", handleClick);

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.un("click", handleClick);
      }
    };
  }, [modalLine]);

  const clearPoints = () => {
    if (pointsSourceRef.current && linesSourceRef.current) {
      pointsSourceRef.current.clear();
      linesSourceRef.current.clear();
      setPoints([]);
      lastPointRef.current = null; // Reset last point reference
    }
  };

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClickPopper = (event: React.MouseEvent<HTMLImageElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className="h-[90vh] w-[95%] relative border-2">c
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <MissionCreation
        points={points}
        modalLine={modalLine}
        setModalLine={setModalLine}
        handleClickPopper={handleClickPopper}
        handleClose={handleClose}
        open={open}
        anchorEl={anchorEl}
        id={id}
        modalPoly={modalPoly}
        setmodalPoly={setModalPoly}
      />
      <PolygonCreation
        polyPoints={points}
        modalPoly={modalPoly}
        setmodalPoly={setModalPoly}
      />
      <BottomControls
        clearPoints={clearPoints}
        modalLine={modalLine}
        setModalLine={setModalLine}
      />
    </div>
  );
};

export default MapView;
