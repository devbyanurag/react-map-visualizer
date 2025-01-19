import React from "react";
import close from "../assets/images/close.png";

interface Point {
  longitude: number;
  latitude: number;
  distanceFromPrevious: number | null;
}

interface PolygonCreationProps {
  polyPoints: Point[];
  modalPoly: boolean;
  setmodalPoly: (value: boolean) => void;
}

const PolygonCreation: React.FC<PolygonCreationProps> = ({
  polyPoints,
  modalPoly,
  setmodalPoly,
}) => {
  return (
    modalPoly && (
      <div className="absolute top-2 left-2 z-10 bg-white rounded shadow-lg max-h-[40vh] overflow-y-scroll w-[500px]">
        <div className="flex justify-between w-full shadow-md p-4">
          <p className="font-bold">Polygon Creation</p>
          <button
            onClick={() => {
              setmodalPoly(false);
            }}
          >
            <img src={close} className="h-4" alt="close" />
          </button>
        </div>

        <div className="p-4">
          {polyPoints.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center px-3 h-5 mb-3">
                <span className="w-[6px] h-[20px] rounded-md mr-3 bg-gray-200 "></span>
                <input type="checkbox" />
                <p className="font-semibold w-9 ml-3">WP</p>
                <p className="font-semibold flex-1">Coordinates</p>
                <p className="font-semibold w-24 mr-4 flex justify-center">
                  Distance (m)
                </p>
              </div>
              <div className="border-[1px] border-gray-200 rounded-md">
                {polyPoints.map((point, index) => (
                  <div
                    className="flex items-center px-3 py-1 border-b bg-[#fafafa] relative"
                    key={index}
                  >
                    <span className="w-[6px] h-[20px] rounded-md mr-3 bg-gray-200 "></span>
                    <input type="checkbox" />
                    <p className="w-9 ml-3">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="flex-1">
                      {point.longitude.toFixed(8)}, {point.latitude.toFixed(8)}
                    </p>
                    <p className="w-24 mr-4 flex justify-center">
                      {point.distanceFromPrevious !== null
                        ? Math.round(point.distanceFromPrevious)
                        : "--"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="border-2 border-dashed border-gray-500 p-4 text-sm rounded-md bg-[#fafafa]">
            Click on the map to mark points of the polygon and then press &#9166;
            to complete the polygon.
          </p>
        </div>
        <div className="flex justify-end w-full px-4 py-2 bg-gray-50">
          <button
            className="text-white bg-blue-400 px-4 py-2 rounded-md"
            onClick={() => {
              setmodalPoly(false);
            }}
          >
            Generate Data
          </button>
        </div>
      </div>
    )
  );
};

export default PolygonCreation;
