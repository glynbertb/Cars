"use client";
import VehicleViewer from "./viewer/VehicleViewer";

// Adapter: keeps the existing dynamic-import path (`components/Viewer`)
// while rendering the new data-driven viewer.
export default function Viewer(props) {
  return <VehicleViewer {...props} />;
}
