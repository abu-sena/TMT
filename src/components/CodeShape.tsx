import React from "react";

export type ShapeType = 
  | "square" 
  | "star" 
  | "circle" 
  | "triangle" 
  | "diamond" 
  | "pentagon" 
  | "heart" 
  | "rectangle" 
  | "hexagon";

export interface CodeShapeProps {
  shapeType: ShapeType;
  color: string;
  className?: string;
  label?: string | number;
}

export const CodeShape = ({ shapeType, color, className = "", label }: CodeShapeProps) => {
  const renderShape = () => {
    switch (shapeType) {
      case "square":
        return <rect x="10" y="10" width="80" height="80" fill={color} />;
      case "star":
        return <polygon points="50,5 61,35 95,35 68,55 78,85 50,65 22,85 32,55 5,35 39,35" fill={color} strokeLinejoin="round" />;
      case "circle":
        return <circle cx="50" cy="50" r="40" fill={color} />;
      case "triangle":
        return <polygon points="50,10 90,85 10,85" fill={color} strokeLinejoin="round" />;
      case "diamond":
        return <polygon points="50,5 90,50 50,95 10,50" fill={color} strokeLinejoin="round" />;
      case "pentagon":
        return <polygon points="50,5 95,38 78,95 22,95 5,38" fill={color} strokeLinejoin="round" />;
      case "heart":
        return <path d="M 50 30 C 50 30 45 10 25 10 C 5 10 5 40 5 40 C 5 60 50 90 50 90 C 50 90 95 60 95 40 C 95 40 95 10 75 10 C 55 10 50 30 50 30 Z" fill={color} />;
      case "rectangle":
        return <rect x="5" y="25" width="90" height="50" fill={color} />;
      case "hexagon":
        return <polygon points="25,5 75,5 95,50 75,95 25,95 5,50" fill={color} strokeLinejoin="round" />;
      default:
        return <circle cx="50" cy="50" r="40" fill={color} />;
    }
  };

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
        {renderShape()}
      </svg>
      {label !== undefined && (
        <span className="absolute text-white font-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" style={{ fontSize: '30%' }}>
          {label}
        </span>
      )}
    </div>
  );
};
