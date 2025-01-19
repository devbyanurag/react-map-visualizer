import React from "react";

interface BottomControlsProps {
  modalLine: boolean;
  setModalLine: (value: boolean) => void;
}

const BottomControls: React.FC<BottomControlsProps> = ({
  modalLine,
  setModalLine
}) => {
  return (
    <div className="absolute bottom-2 right-2 z-10 space-x-2">
      <button
        className="bg-blue-700 py-2 px-3 rounded-md text-white"
        onClick={() => {
          setModalLine(!modalLine);
        }}
      >
        {!modalLine ? "Draw" : "Close Draw"}
      </button>
     
    </div>
  );
};

export default BottomControls;
