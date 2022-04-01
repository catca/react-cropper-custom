import React, { FC, useEffect, useRef, useState } from 'react';
import normalizeWheel from 'normalize-wheel';
import './index.css';
import { CropperProps, Point, Size } from '@src/types';
import { restrictPosition, clamp, getDistanceBetweenPoints, getCenter } from '@utils/Utils';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const Cropper: FC<CropperProps> = ({
  src,
  width,
  height,
  zoom = 1,
  onZoomChange = () => {},
  onCropComplete,
}: CropperProps) => {
  const [cropSize, setCropSize] = useState<Size>({ width: width, height: height });
  const [image, setImage] = useState<Size>({ width: 0, height: 0 });
  const [ratio, setRatio] = useState<number>(1);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [onEvent, setOnEvent] = useState<boolean>(false);
  const cropRef = useRef<Point>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);
  const imageSizeRef = useRef<Size>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const rafDragTimeout = useRef<null | number>();
  const rafPinchTimeout = useRef<null | number>();
  const dragStartPosition = useRef<Point>({ x: 0, y: 0 });
  const lastPinchDistance = useRef<number>(0);

  useEffect(() => {
    imgSizeInit();
    return cleanEvents();
  }, [src]);

  useEffect(() => {
    zoomRef.current = zoom;
    window.addEventListener('resize', imgResize);
    return () => {
      // cleanup
      window.removeEventListener('resize', imgResize);
    };
  }, []);

  const imgSizeInit = () => {
    const img = new Image();
    img.addEventListener('load', () => {
      imageSizeRef.current.width = img.width;
      imageSizeRef.current.height = img.height;
      const imgRatio = img.width / img.height;
      let cropWidth = cropSize.width;
      let cropHeight = cropSize.height;
      if (width === 0 && height === 0) {
        cropWidth = containerRef.current!.offsetWidth;
        cropHeight = containerRef.current!.offsetHeight;
        setCropSize({ width: cropWidth, height: cropHeight });
      }
      const cropRatio = cropWidth / cropHeight;
      if (imgRatio > cropRatio) {
        const tempRatio = img.height / cropHeight;
        setImage({ width: img.width / tempRatio, height: cropHeight });
        setRatio(tempRatio);
      } else {
        const tempRatio = img.width / cropWidth;
        setImage({ width: cropWidth, height: img.height / tempRatio });
        setRatio(tempRatio);
      }
    });
    img.src = src;
  };

  const imgResize = () => {
    if (width === 0 && height === 0) {
      cropInit();
      const imgRatio = imageSizeRef.current.width / imageSizeRef.current.height;
      const cropWidth = containerRef.current!.offsetWidth;
      const cropHeight = containerRef.current!.offsetHeight;
      const cropRatio = cropWidth / cropHeight;
      setCropSize({ width: cropWidth, height: cropHeight });
      if (imgRatio > cropRatio) {
        const tempRatio = imageSizeRef.current.height / cropHeight;
        setImage({ width: imageSizeRef.current.width / tempRatio, height: cropHeight });
        setRatio(tempRatio);
      } else {
        const tempRatio = imageSizeRef.current.width / cropWidth;
        setImage({ width: cropWidth, height: imageSizeRef.current.height / tempRatio });
        setRatio(tempRatio);
      }
    }
  };

  const cropInit = () => {
    cropRef.current.x = 0;
    cropRef.current.y = 0;
    zoomRef.current = 1;
    setCrop({ ...crop, x: 0, y: 0 });
  };

  const getMousePoint = (e: MouseEvent | React.MouseEvent) => ({
    x: Number(e.clientX),
    y: Number(e.clientY),
  });

  const getTouchPoint = (touch: Touch | React.Touch) => ({
    x: Number(touch.clientX),
    y: Number(touch.clientY),
  });

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
    x: (x + crop.x) / zoomRef.current,
    y: (y + crop.y) / zoomRef.current,
  });

  const cleanEvents = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onDragStopped);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onDragStopped);
  };

  const onDragStopped = () => {
    cleanEvents();
    emitCropData();
    setOnEvent(false);
  };

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

    onCropComplete(emitCropSize);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    setOnEvent(true);
    dragStartPosition.current.x = e.clientX - crop.x;
    dragStartPosition.current.y = e.clientY - crop.y;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onDragStopped);
  };

  const onMouseMove = (e: MouseEvent) => {
    const requestedPosition = {
      x: e.clientX - dragStartPosition.current.x,
      y: e.clientY - dragStartPosition.current.y,
    };
    const newPosition = restrictPosition(requestedPosition, cropSize, image, zoomRef.current);
    setCrop(newPosition);
    cropRef.current = newPosition;
  };

  const setNewZoom = (zoom: number, point: Point) => {
    const zoomPoint = getPointOnContainer(point);
    const zoomTarget = getPointOnMedia(zoomPoint);
    const newZoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
    const requestedPosition = {
      x: zoomTarget.x * newZoom - zoomPoint.x,
      y: zoomTarget.y * newZoom - zoomPoint.y,
    };
    const newPosition = restrictPosition(requestedPosition, cropSize, image, newZoom);
    setCrop(newPosition);
    onZoomChange(newZoom);
    zoomRef.current = newZoom;
    cropRef.current = newPosition;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const point = getMousePoint(e);
    const { pixelY } = normalizeWheel(e);
    const newZoom = zoomRef.current - pixelY / 200;
    setNewZoom(newZoom, point);
    emitCropData();
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onDragStopped);

    if (e.touches.length === 2) {
      onPinchStart(e);
    } else if (e.touches.length === 1) {
      onDragStart(getTouchPoint(e.touches[0]));
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    // Prevent whole page from scrolling on iOS.
    e.preventDefault();
    setOnEvent(true);
    if (e.touches.length === 2) {
      onPinchMove(e);
    } else if (e.touches.length === 1) {
      onDrag(getTouchPoint(e.touches[0]));
    }
  };

  const onDragStart = ({ x, y }: Point) => {
    dragStartPosition.current.x = x - crop.x;
    dragStartPosition.current.y = y - crop.y;
  };

  const onDrag = ({ x, y }: Point) => {
    if (rafDragTimeout.current) window.cancelAnimationFrame(rafDragTimeout.current);

    rafDragTimeout.current = window.requestAnimationFrame(() => {
      if (x === undefined || y === undefined) return;
      const requestedPosition = {
        x: x - dragStartPosition.current.x,
        y: y - dragStartPosition.current.y,
      };

      const newPosition = restrictPosition(requestedPosition, cropSize, image, zoomRef.current);
      setCrop(newPosition);
      cropRef.current = newPosition;
    });
  };

  const onPinchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const pointA = getTouchPoint(e.touches[0]);
    const pointB = getTouchPoint(e.touches[1]);
    lastPinchDistance.current = getDistanceBetweenPoints(pointA, pointB);
    onDragStart(getCenter(pointA, pointB));
  };

  const onPinchMove = (e: TouchEvent) => {
    e.preventDefault();
    const pointA = getTouchPoint(e.touches[0]);
    const pointB = getTouchPoint(e.touches[1]);
    const center = getCenter(pointA, pointB);
    onDrag(center);

    if (rafPinchTimeout.current) window.cancelAnimationFrame(rafPinchTimeout.current);
    rafPinchTimeout.current = window.requestAnimationFrame(() => {
      const distance = getDistanceBetweenPoints(pointA, pointB);
      const newZoom = zoomRef.current * (distance / lastPinchDistance.current);
      setNewZoom(newZoom, center);
      lastPinchDistance.current = distance;
    });
  };

  return (
    <div
      className="cropper-container"
      ref={containerRef}
      onMouseDown={(e) => onMouseDown(e)}
      onTouchStart={(e) => onTouchStart(e)}
      onWheel={(e) => onWheel(e)}
      style={{
        width: `${cropSize.width === 0 ? '100%' : `${cropSize.width}px`}`,
        height: `${cropSize.height === 0 ? '100%' : `${cropSize.height}px`}`,
        cursor: `${onEvent ? 'grabbing' : 'grab'}`,
      }}
    >
      <div
        className="cropper-image"
        ref={imageRef}
        style={{
          width: `${image.width}px`,
          height: `${image.height}px`,
          backgroundImage: `url(${src})`,
          transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoomRef.current})`,
        }}
      />
      <div className="cropper-area" style={{ display: `${onEvent ? 'block' : 'none'}` }} />
    </div>
  );
};
export default Cropper;
