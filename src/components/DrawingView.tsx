import React, { useRef, useImperativeHandle } from "react";
import { Point3D } from "../types/geometry";

// Constantes globais para tamanhos e visualização
const CIRCLE_RADIUS = 20;
const LABEL_FONT_SIZE = 14;
const DIMENSION_FONT_SIZE = 14;
const LINE_STROKE_WIDTH = 1;

// Constantes para viewBox fixo
const FIXED_VIEW_WIDTH = 1200; // Largura fixa do viewBox
const FIXED_VIEW_HEIGHT = 800; // Altura fixa do viewBox

interface DimensionLineProps {
  startPoint: Point3D;
  endPoint: Point3D;
  dimensionOffset?: number;
  extensionLength?: number;
}

const DimensionLine: React.FC<DimensionLineProps> = ({
  startPoint,
  endPoint,
  dimensionOffset = 40,
}) => {
  const distance = Math.round(
    Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) +
        Math.pow(endPoint.y - startPoint.y, 2) +
        Math.pow(endPoint.z - startPoint.z, 2)
    )
  );

  const dimensionStartPoint = {
    x: startPoint.x,
    y: startPoint.y - dimensionOffset,
    z: startPoint.z,
  };

  const dimensionEndPoint = {
    x: endPoint.x,
    y: endPoint.y - dimensionOffset,
    z: endPoint.z,
  };

  return (
    <g>
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={dimensionStartPoint.x}
        y2={dimensionStartPoint.y}
        stroke="black"
        strokeWidth={LINE_STROKE_WIDTH}
      />
      <line
        x1={endPoint.x}
        y1={endPoint.y}
        x2={dimensionEndPoint.x}
        y2={dimensionEndPoint.y}
        stroke="black"
        strokeWidth={LINE_STROKE_WIDTH}
      />
      <line
        x1={dimensionStartPoint.x}
        y1={dimensionStartPoint.y}
        x2={dimensionEndPoint.x}
        y2={dimensionEndPoint.y}
        stroke="black"
        strokeWidth={LINE_STROKE_WIDTH}
      />
      <text
        x={(dimensionStartPoint.x + dimensionEndPoint.x) / 2}
        y={dimensionStartPoint.y - 5}
        textAnchor="middle"
        fontSize={DIMENSION_FONT_SIZE}
        fill="black"
      >
        {`${distance}mm`}
      </text>
    </g>
  );
};

interface Grid {
  startPoint: Point3D;
  endPoint: Point3D;
  circleRadius: number;
  label: string;
}

interface DrawingViewProps {
  gridCount: number;
  spacing: number;
  gridLength: number;
}

export const DrawingView = React.forwardRef<
  { downloadSvg: () => void },
  DrawingViewProps
>(({ gridCount, spacing, gridLength }, ref) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Estado para controle do zoom (viewBox)
  const viewBox = useRef({
    x: 0,
    y: 0,
    width: FIXED_VIEW_WIDTH,
    height: FIXED_VIEW_HEIGHT,
  });

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();

    if (!event.ctrlKey) return;

    const zoomFactor = 0.1;
    const scale = event.deltaY < 0 ? 1 - zoomFactor : 1 + zoomFactor;

    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomPointX =
      (mouseX / rect.width) * viewBox.current.width + viewBox.current.x;
    const zoomPointY =
      (mouseY / rect.height) * viewBox.current.height + viewBox.current.y;

    const newWidth = viewBox.current.width * scale;
    const newHeight = viewBox.current.height * scale;

    viewBox.current = {
      x: zoomPointX - (zoomPointX - viewBox.current.x) * scale,
      y: zoomPointY - (zoomPointY - viewBox.current.y) * scale,
      width: newWidth,
      height: newHeight,
    };

    svg.setAttribute(
      "viewBox",
      `${viewBox.current.x} ${viewBox.current.y} ${viewBox.current.width} ${viewBox.current.height}`
    );
  };

  // Calcula o centro do viewBox
  const centerX = FIXED_VIEW_WIDTH / 2;
  const centerY = FIXED_VIEW_HEIGHT / 2;

  const firstGridX = 600; // Posição fixa do primeiro grid

  const grids: Grid[] = Array.from({ length: gridCount }, (_, i) => ({
    startPoint: {
      x: firstGridX + i * spacing, // Apenas os demais grids se deslocam
      y: centerY - gridLength / 2,
      z: 0,
    },
    endPoint: {
      x: firstGridX + i * spacing,
      y: centerY + gridLength / 2,
      z: 0,
    },
    circleRadius: CIRCLE_RADIUS,
    label: `${i + 1}`,
  }));

  const renderGrid = (grid: Grid, index: number) => {
    return (
      <g key={index}>
        <line
          x1={grid.startPoint.x}
          y1={grid.startPoint.y}
          x2={grid.endPoint.x}
          y2={grid.endPoint.y}
          stroke="black"
          strokeWidth={LINE_STROKE_WIDTH}
        />
        <circle
          cx={grid.startPoint.x}
          cy={grid.startPoint.y}
          r={CIRCLE_RADIUS}
          fill="white"
          stroke="black"
          strokeWidth={LINE_STROKE_WIDTH}
        />
        <text
          x={grid.startPoint.x}
          y={grid.startPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={LABEL_FONT_SIZE}
        >
          {grid.label}
        </text>
        <circle
          cx={grid.endPoint.x}
          cy={grid.endPoint.y}
          r={CIRCLE_RADIUS}
          fill="white"
          stroke="black"
          strokeWidth={LINE_STROKE_WIDTH}
        />
        <text
          x={grid.endPoint.x}
          y={grid.endPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={LABEL_FONT_SIZE}
        >
          {grid.label}
        </text>
      </g>
    );
  };

  const renderDimensions = () => {
    return grids
      .slice(0, -1)
      .map((grid, index) => (
        <DimensionLine
          key={`dimension-${index}`}
          startPoint={grid.startPoint}
          endPoint={grids[index + 1].startPoint}
        />
      ));
  };

  const renderCartesianPlane = () => {
    return (
      <g>
        {/* Eixos do plano cartesiano */}
        <line
          x1={0}
          y1={centerY}
          x2={FIXED_VIEW_WIDTH}
          y2={centerY}
          stroke="blue"
          strokeWidth={1}
        />
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={FIXED_VIEW_HEIGHT}
          stroke="blue"
          strokeWidth={1}
        />
        {/* Origem (0,0,0) */}
        <circle cx={centerX} cy={centerY} r={5} fill="red" />
        <text
          x={centerX + 10}
          y={centerY - 10}
          fontSize={LABEL_FONT_SIZE}
          fill="red"
        >
          0,0,0
        </text>
      </g>
    );
  };

  const downloadSvg = () => {
    if (svgRef.current) {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "drawing.svg";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  useImperativeHandle(ref, () => ({
    downloadSvg,
  }));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
      }}
    >
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
          border: "1px solid black",
          background: "white",
        }}
        viewBox={`0 0 ${FIXED_VIEW_WIDTH} ${FIXED_VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
      >
        {renderCartesianPlane()}
        <g>
          {grids.map((grid, index) => renderGrid(grid, index))}
          {renderDimensions()}
        </g>
      </svg>
    </div>
  );
});

DrawingView.displayName = "DrawingView";
