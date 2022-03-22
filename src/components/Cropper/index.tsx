import { CropperProps, Point, Size } from '@src/types';
import getCroppedImg, { restrictPosition, clamp } from '@utils/Utils';
import React, { FC, useEffect, useRef, useState } from 'react';
import normalizeWheel from 'normalize-wheel';
import './index.css';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const Cropper: FC<CropperProps> = ({ src, width, height, onCropComplete }: CropperProps) => {
  const cropSize = { width: width, height: height };
  const [image, setImage] = useState<Size>({ width: 0, height: 0 });
  const [ratio, setRatio] = useState<number>(1);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const cropRef = useRef<Point>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const dragStartPosition = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.addEventListener('load', () => {
      if (img.width > img.height) {
        const tempRatio = img.height / cropSize.height;
        setImage({ width: img.width / tempRatio, height: cropSize.height });
        setRatio(tempRatio);
      } else {
        const tempRatio = img.width / cropSize.width;
        setImage({ width: cropSize.width, height: img.height / tempRatio });
        setRatio(tempRatio);
      }
    });
    img.src = src;
    return cleanEvents();
  }, [src]);

  const getMousePoint = (e: MouseEvent | React.MouseEvent) => ({
    x: Number(e.clientX),
    y: Number(e.clientY),
  });

  const emitCropData = () => {
    const cropX =
      (((image.width * zoomRef.current - cropSize.width) / 2 - cropRef.current.x) * ratio) / zoomRef.current;
    const cropY =
      (((image.height * zoomRef.current - cropSize.height) / 2 - cropRef.current.y) * ratio) / zoomRef.current;
    const cropWidth = (cropSize.width * ratio) / zoomRef.current;
    const cropHeight = (cropSize.height * ratio) / zoomRef.current;
    const emitCropSize = {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    };

    const croppedImage = getCroppedImg(src, emitCropSize);
    onCropComplete(emitCropSize, croppedImage);
  };

  const onMouseMove = (e: MouseEvent) => {
    const requestedPosition = {
      x: e.clientX - dragStartPosition.current.x,
      y: e.clientY - dragStartPosition.current.y,
    };
    const newPosition = restrictPosition(requestedPosition, cropSize, image, zoom);
    setCrop(newPosition);
    cropRef.current = newPosition;
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    dragStartPosition.current.x = e.clientX - crop.x;
    dragStartPosition.current.y = e.clientY - crop.y;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onDragStopped);
  };

  const cleanEvents = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onDragStopped);
  };

  const onDragStopped = () => {
    cleanEvents();
    emitCropData();
  };

  const getPointOnContainer = ({ x, y }: Point) => {
    if (containerRef.current) {
      return {
        x: containerRef.current.offsetWidth / 2 - (x - containerRef.current.offsetLeft),
        y: containerRef.current.offsetHeight / 2 - (y - containerRef.current.offsetTop),
      };
    }
    return {
      x: 0,
      y: 0,
    };
  };

  const getPointOnMedia = ({ x, y }: Point) => ({
    x: (x + crop.x) / zoom,
    y: (y + crop.y) / zoom,
  });

  const setNewZoom = (zoom: number, point: Point) => {
    const zoomPoint = getPointOnContainer(point);
    const zoomTarget = getPointOnMedia(zoomPoint);
    const newZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const requestedPosition = {
      x: zoomTarget.x * newZoom - zoomPoint.x,
      y: zoomTarget.y * newZoom - zoomPoint.y,
    };
    const newPosition = restrictPosition(requestedPosition, cropSize, image, newZoom);
    setZoom(newZoom);
    setCrop(newPosition);
    zoomRef.current = newZoom;
    cropRef.current = newPosition;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const point = getMousePoint(e);
    const { pixelY } = normalizeWheel(e);
    const newZoom = zoom - pixelY / 200;
    setNewZoom(newZoom, point);
    emitCropData();
  };

  return (
    <div
      className="cropper-container"
      ref={containerRef}
      onWheel={(e) => onWheel(e)}
      style={{ width: `${cropSize.width}px`, height: `${cropSize.height}px` }}
    >
      <div
        className="cropper-image"
        ref={imageRef}
        onMouseDown={(e) => onMouseDown(e)}
        style={{
          width: `${image.width}px`,
          height: `${image.height}px`,
          backgroundImage: `url(${src})`,
          transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
        }}
      />
      <div className="cropper-area" />
    </div>
  );
};
export default Cropper;
