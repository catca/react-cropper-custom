export type Size = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Area = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export type AreaProps = {
  x: number;
  y: number;
};

export interface CropperProps {
  src: string;
  width: number;
  height: number;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  onCropComplete: (croppedArea: Area) => void;
}
