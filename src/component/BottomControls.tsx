import React from "react";

interface BottomControlsProps {
  modalLine: boolean;
  setModalLine: (value: boolean) => void;
  clearPoints: () => void;
}

const BottomControls: React.FC<BottomControlsProps> = ({
  modalLine,
  setModalLine,
  clearPoints,
}) => {
  return (
    <div className="absolute bottom-2 right-2 z-10 space-x-2">
      <button
        style={{
          backgroundColor: "#5046c3",
          padding: "7px 10px",
          borderRadius: "5px",
          color: "white",
        }}
        onClick={() => {
          setModalLine(!modalLine);
        }}
      >
        {!modalLine ? "Draw" : "Close Draw"}
      </button>
      <button
        style={{
          backgroundColor: "red",
          padding: "7px 10px",
          borderRadius: "5px",
          color: "white",
        }}
        onClick={clearPoints}
      >
        Clear Points
      </button>
    </div>
  );
};

export default BottomControls;
