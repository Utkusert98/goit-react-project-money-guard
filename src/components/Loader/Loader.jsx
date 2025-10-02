import React from "react";
import { RotatingLines } from "react-loader-spinner";

const Loader = ({ visible = true, height = 40, width = 40 }) => {
  if (!visible) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <RotatingLines
        strokeColor="grey"
        strokeWidth="5"
        animationDuration="0.75"
        width={width}
        visible={visible}
      />
    </div>
  );
};

export default Loader;