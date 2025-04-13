import React, { useRef, useState } from "react";
import { DrawingView } from "../../components/DrawingView";
import { ThreeDScene } from "../3dScene";
import Hybrid3DScene from "../Hybrid3DScene";
import "./MainLayout.css";

interface TabProps {
  value: string;
  label: string;
  onClick: (value: string) => void;
  isActive: boolean;
}

const Tab: React.FC<TabProps> = ({ value, label, onClick, isActive }) => (
  <button
    className={`tab-button ${isActive ? "active" : ""}`}
    onClick={() => onClick(value)}
  >
    {label}
  </button>
);

interface TabPanelProps {
  value: string;
  label: string;
  children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ children }) => <>{children}</>;

interface TabsProps {
  value: string;
  onTabChange: (value: string) => void;
  children:
    | React.ReactElement<TabPanelProps>
    | React.ReactElement<TabPanelProps>[];
}

const Tabs: React.FC<TabsProps> = ({ value, onTabChange, children }) => {
  const tabChildren = React.Children.toArray(
    children
  ) as React.ReactElement<TabPanelProps>[];

  return (
    <div className="tabs">
      <div className="tab-list">
        {tabChildren.map((child) => (
          <Tab
            key={child.props.value}
            value={child.props.value}
            label={child.props.label}
            onClick={onTabChange}
            isActive={value === child.props.value}
          />
        ))}
      </div>
      <div className="tab-panels">
        {tabChildren.map((child) =>
          value === child.props.value ? (
            <div key={child.props.value} className="tab-panel">
              {child}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export function MainLayout() {
  const drawingViewRef = useRef<{ downloadSvg: () => void }>(null);
  const [gridCount, setGridCount] = useState(3);
  const [spacing, setSpacing] = useState(100);
  const [gridLength, setGridLength] = useState(200);
  const [activeTab, setActiveTab] = useState<string>("2d");

  const handleDownloadSvg = () => {
    drawingViewRef.current?.downloadSvg();
  };

  const handleImportIFC = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ifc";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const event = new CustomEvent("ifc-file-selected", { detail: file });
        window.dispatchEvent(event);
      }
    };
    input.click();
  };

  return (
    <div className="layout">
      <div className="ribbon">
        <div style={{ display: "flex", gap: "20px", padding: "10px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "3px",
              }}
              onClick={handleImportIFC}
              disabled={activeTab === "2d"}
            >
              Import IFC
            </button>

            <button
              style={{
                padding: "8px 16px",
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "3px",
              }}
              onClick={handleDownloadSvg}
              disabled={activeTab !== "2d"}
            >
              Export SVG
            </button>
          </div>

          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "white",
              }}
            >
              <span>Grids:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={gridCount}
                onChange={(e) => setGridCount(Number(e.target.value))}
                style={{ width: "120px" }}
              />
              <span>{gridCount}</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "white",
              }}
            >
              <span>Spacing:</span>
              <input
                type="range"
                min="10"
                max="300"
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
                style={{ width: "120px" }}
              />
              <span>{spacing}mm</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "white",
              }}
            >
              <span>Length:</span>
              <input
                type="range"
                min="50"
                max="500"
                value={gridLength}
                onChange={(e) => setGridLength(Number(e.target.value))}
                style={{ width: "120px" }}
              />
              <span>{gridLength}mm</span>
            </label>
          </div>
        </div>
      </div>

      <div className="properties">Properties Panel</div>

      <div className="content">
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <TabPanel value="2d" label="2D">
            <div className="drawing-container">
              <DrawingView
                ref={drawingViewRef}
                gridCount={gridCount}
                spacing={spacing}
                gridLength={gridLength}
              />
            </div>
          </TabPanel>
          <TabPanel value="3d" label="3D">
            <div className="three-d-container">
              <ThreeDScene />
            </div>
          </TabPanel>
          <TabPanel value="project" label="Project">
            <div className="three-d-container">
              <Hybrid3DScene
                gridCount={gridCount}
                spacing={spacing}
                gridLength={gridLength}
              />
            </div>
          </TabPanel>
        </Tabs>
      </div>

      <div className="projectNavigator">Project Navigator</div>

      <div className="footer">Footer</div>
    </div>
  );
}
export default MainLayout;
