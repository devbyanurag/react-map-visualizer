import React from "react";
import close from "../assets/images/close.png";
import upload from "../assets/images/upload.png";
import option from "../assets/images/option.png";
import insertbelow from "../assets/images/insertbelow.png";
import { Popover } from "@mui/material";
import { PointDataIf } from "../uitls/interfaces";



interface MissionCreationProps {
  points: PointDataIf[];
  modalLine: boolean;
  setModalLine: (value: boolean) => void;
  modalPoly: boolean;
  setmodalPoly: (value: boolean) => void;
  setPolyPoints: React.Dispatch<React.SetStateAction<PointDataIf[]>>
}

const MissionCreation: React.FC<MissionCreationProps> = ({
  points,
  modalLine,
  setModalLine,
  modalPoly,
  setmodalPoly,
  setPolyPoints
}) => {
  const [openPopoverIndex, setOpenPopoverIndex] = React.useState<number | null>(null);
  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleClickPopperOver = (index: number, point: PointDataIf) => {
    console.log(index, point);
    setmodalPoly(true);
    setPolyPoints([
      {
        number: point.number,
        longitude: point.longitude,
        latitude: point.latitude,
        distanceFromPrevious: point.distanceFromPrevious,
        type: "POLY",
      },
    ]);
    setOpenPopoverIndex(null);
    setPopoverAnchorEl(null);
  };

  const handlePopoverOpen = (index: number, event: React.MouseEvent<HTMLElement>) => {
    setOpenPopoverIndex(index);
    setPopoverAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setOpenPopoverIndex(null);
    setPopoverAnchorEl(null);
  };

  return (
    modalLine &&
    !modalPoly && (
      <div className="absolute top-2 left-2 z-10 bg-white rounded shadow-lg max-h-[40vh] overflow-y-scroll w-[500px]">
        <div className="flex justify-between w-full shadow-md p-4">
          <p className="font-bold">Mission Creation</p>
          <button
            onClick={() => {
              setModalLine(false);
            }}
          >
            <img src={close} className="h-4" alt="close" />
          </button>
        </div>

        <div className="p-4">
          {points.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center px-3 h-5 mb-3">
                <span className="w-[6px] h-[20px] rounded-md mr-3 bg-gray-200 "></span>
                <input type="checkbox" />
                <p className="font-semibold w-9 ml-3">WP</p>
                <p className="font-semibold flex-1">Coordinates</p>
                <p className="font-semibold w-24 mr-4 flex justify-center">
                  Distance (m)
                </p>
                <img src={upload} alt="upload" className="h-5" />
              </div>
              <div className="border-[1px] border-gray-200 rounded-md">
                {points.map((point, index) => (
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
                    <img
                      src={option}
                      alt="option"
                      className="h-5 hover:cursor-pointer"
                      aria-describedby={"simple-popover"}
                      onClick={(event) => handlePopoverOpen(index, event)}
                    />
                    <Popover
                      id={index.toString()}
                      open={openPopoverIndex === index}
                      anchorEl={popoverAnchorEl}
                      onClose={handlePopoverClose}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      className="rounded-md"
                      slotProps={{
                        paper: {
                          sx: {
                            boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.1)",
                          },
                        },
                      }}
                    >
                      <div className="rounded-md p-1">
                        <div
                          className="h-8 flex items-center hover:bg-[#dcdcdc] rounded-md px-2 hover:cursor-pointer"
                          onClick={() => handleClickPopperOver(index, point)}
                        >
                          <img
                            src={insertbelow}
                            alt="insertbelow"
                            className="h-[70%] mr-1"
                          />
                          <p>Insert Polygon before</p>
                        </div>
                        <div
                          className="h-8 flex items-center hover:bg-[#dcdcdc] rounded-md px-2 hover:cursor-pointer"
                          onClick={() => handleClickPopperOver(index, point)}
                        >
                          <img
                            src={insertbelow}
                            alt="insertbelow"
                            className="h-[70%] mr-1 rotate-180"
                          />
                          <p>Insert Polygon after</p>
                        </div>
                      </div>
                    </Popover>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="border-2 border-dashed border-gray-500 p-4 text-sm rounded-md bg-[#fafafa]">
            Click on the map to mark points of the route and then press &#9166;
            to complete the route.
          </p>
        </div>
        <div className="flex justify-end w-full px-4 py-2 bg-gray-50">
          <button
            className="text-white bg-blue-400 px-4 py-2 rounded-md"
            onClick={() => {
              setModalLine(false);
            }}
          >
            Generate Data
          </button>
        </div>
      </div>
    )
  );
};



export default MissionCreation;
