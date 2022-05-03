export type Size = {
  readonly width: number;
  readonly height: number;
};

export type Point = {
  readonly x: number;
  readonly y: number;
};

export type Area = {
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
};

export type AreaProps = {
  readonly x: number;
  readonly y: number;
};

export interface CropperProps {
  readonly src: string;
  readonly width?: number;
  readonly height?: number;
  readonly aspect?: number;
  readonly zoom?: number;
  readonly minZoom?: number;
  readonly maxZoom?: number;
  readonly onZoomChange?: (zoom: number) => void;
  readonly onCropComplete: (croppedArea: Area) => void;
  readonly initialCroppedArea?: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}
