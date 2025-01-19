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
import { ActiveEnterPointsIf, MissionPointIf, PointDataIf, PolygonDataIf } from "../uitls/interfaces";
import { toast } from "react-toastify";



const MapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const pointsSourceRef = useRef<VectorSource | null>(null);
  const linesSourceRef = useRef<VectorSource | null>(null);
  const [points, setPoints] = useState<MissionPointIf[]>([]);
  const [modalLine, setModalLine] = useState<boolean>(false);
  const [modalPoly, setModalPoly] = useState<boolean>(false);
  const [modalPolyIndex, setModalPolyIndex] = useState<number | null>(null);

  const [polyPoints, setPolyPoints] = useState<PointDataIf[]>([]);


  const mapObjRef = useRef<Map | null>(null);
  const lastPointRef = useRef<Feature | null>(null);
  const [activeEnterPoints, setActiveEnterPoints] = useState<ActiveEnterPointsIf>({ line: true, poly: false })
  const [belowActive, setbelowActive] = useState<boolean | null>(null)


  const isPointData = (point: MissionPointIf): point is PointDataIf => {
    return (point as PointDataIf).type === "LINE" || (point as PointDataIf).type === "POLY";
  };
  const addPolygonAtIndex = () => {
    if(modalPolyIndex==null) return
    let insertOn=modalPolyIndex;
    if(!belowActive && belowActive!=null){
      insertOn++
    }
    setPoints(prevPoints => {
      if (insertOn < 0 || insertOn > prevPoints.length) {
        toast.error("Invalid insert index!");
        return prevPoints;
      }
  
      const newPolygon: PolygonDataIf = {
        type: "POLYGON",
        number: insertOn + 1,  // Add number to polygon
        points: polyPoints
      };
  
      const updatedPoints = [...prevPoints];
      updatedPoints.splice(insertOn, 0, newPolygon);
  
      // Update numbers for points after the insertion
      for (let i = insertOn + 1; i < updatedPoints.length; i++) {
        if (isPointData(updatedPoints[i])) {
          updatedPoints[i] = {
            ...updatedPoints[i],
            number: i + 1
          };
        } else {
          // Update polygon number if it's a polygon
          updatedPoints[i] = {
            ...updatedPoints[i],
            number: i + 1
          };
        }
      }
  
      return updatedPoints;
    });
  
    // Clear polygon points after adding
    setPolyPoints([]);
  };

  const handleActiveEnterPoints = (key: keyof ActiveEnterPointsIf, val: boolean) => {
    setActiveEnterPoints(prevState => ({
      ...prevState,
      [key]: val,
    }));
  };

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
            stroke: pointNumber === 1 || feature === lastPointRef.current ? new Stroke({ color: 'black', width: 2 }) : undefined
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
        zoom: 4,
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
      if (modalLine && !modalPoly && activeEnterPoints.line) {
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

          if (lastPointRef.current) {
            lastPointRef.current.changed();
          }
          lastPointRef.current = point;

          pointsSourceRef.current!.addFeature(point);

          if (prevPoints.length > 0) {
            const prevPoint = prevPoints[prevPoints.length - 1];
            
            // Type check the previous point
            if (isPointData(prevPoint)) {
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
          }

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
              type: "LINE"
            } as PointDataIf,
          ];
        });
      }
      else if (modalLine && modalPoly && activeEnterPoints.poly) {
        const clickedCoord = event.coordinate;
        const lonLat = transform(clickedCoord, "EPSG:3857", "EPSG:4326");

        setPolyPoints((prevPoints) => {
          const pointNumber = prevPoints.length + 1;
          let distanceFromPrevious: number | null = null;

          const point = new Feature({
            geometry: new Point(clickedCoord),
            label: `Point ${pointNumber}`,
            pointNumber,
          });

          const pointStyle = new Style({
            image: new Circle({
              radius: 3, // Circle radius
              fill: new Fill({
                color: "#fdb605", // Set fill color based on condition
              })
            }),
          });
          point.setStyle(pointStyle);


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

            line.setStyle(
              new Style({
                stroke: new Stroke({
                  color: "#fdb605", // Line color
                  width: 2,        // Line width
                  lineDash: [10, 5], // Dash pattern: 10px line, 5px gap
                }),
              })
            );
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
              type: "LINE"
            },
          ];
        });
      }

    };

    mapObjRef.current.on("click", handleClick);

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.un("click", handleClick);
      }
    };
  }, [modalLine, modalPoly, activeEnterPoints]);


  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && modalPoly) {
        if (polyPoints.length < 3) {
          toast.error("Polygon need alteast 2 points!");
          return
        }
        const prevPoint = polyPoints[polyPoints.length - 1];
        const prevCoord = transform(
          [prevPoint.longitude, prevPoint.latitude],
          "EPSG:4326",
          "EPSG:3857"
        );
        const fisrtCoord = transform(
          [polyPoints[0].longitude, polyPoints[0].latitude],
          "EPSG:4326",
          "EPSG:3857"
        );
        const line = new Feature({
          geometry: new LineString([prevCoord, fisrtCoord]),
        });

        line.setStyle(
          new Style({
            stroke: new Stroke({
              color: "#fdb605", // Line color
              width: 2,        // Line width
              lineDash: [10, 5], // Dash pattern: 10px line, 5px gap
            }),
          })
        );
        linesSourceRef.current!.addFeature(line);
        handleActiveEnterPoints("poly", false)

      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [modalPoly, polyPoints]);






  return (
    <div className="h-[90vh] w-[95%] relative border-2">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <MissionCreation
        points={points}
        modalLine={modalLine}
        setModalLine={setModalLine}
        modalPoly={modalPoly}
        setmodalPoly={setModalPoly}
        setPolyPoints={setPolyPoints}
        handleActiveEnterPoints={handleActiveEnterPoints}
        setbelowActive={setbelowActive}
        setModalPolyIndex={setModalPolyIndex}

      />
      <PolygonCreation
        polyPoints={polyPoints}
        modalPoly={modalPoly}
        setmodalPoly={setModalPoly}
        setPolyPoints={setPolyPoints}
        setbelowActive={setbelowActive}
        setModalPolyIndex={setModalPolyIndex}
        addPolygonAtIndex={addPolygonAtIndex}
      />
      <BottomControls
        modalLine={modalLine}
        setModalLine={setModalLine}
      />
     
    </div>
  );
};

export default MapView;
