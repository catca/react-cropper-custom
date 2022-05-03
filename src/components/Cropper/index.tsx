import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import normalizeWheel from 'normalize-wheel';
import './index.css';
import type { CropperProps, Size, Point } from '@src/types';
import {
  getInitialCropFromCroppedAreaPixels,
  restrictPosition,
  flexiblePosition,
  clamp,
  getDistanceBetweenPoints,
  getCenter,
} from '@utils/Utils';

const Cropper: FC<CropperProps> = ({
  src,
  width = 0,
  height = 0,
  aspect = 1,
  zoom = 1,
  minZoom = 1,
  maxZoom = 3,
  onZoomChange = () => {},
  onCropComplete,
  initialCroppedArea,
}: CropperProps) => {
  const [cropSize, setCropSize] = useState<Size>({ width, height });
  const [imageSize, setImageSize] = useState<Size>({ width: 0, height: 0 });
  const [ratio, setRatio] = useState<number>(1);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [onEvent, setOnEvent] = useState<boolean>(false);
  const [completeInitial, setCompleteInitial] = useState<boolean>(false);
  const cropRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);
  const imageSizeRef = useRef({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const rafDragTimeout = useRef<null | number>();
  const rafPinchTimeout = useRef<null | number>();
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef<number>(0);
  const onTouch = useRef<boolean>(false);

  useEffect(() => {
    if (imageSize.width === 0 || imageSize.height === 0) return;
    const point = {
      x: cropSize.width / 2,
      y: cropSize.height / 2,
    };
    setNewZoom(zoom, point);
    emitCropData();
  }, [zoom]);

  useEffect(() => {
    imgSizeInit();
    return void cleanEvents();
  }, [src]);

  useEffect(() => {
    window.addEventListener('resize', imgResize);
    imgResize();
    return () => {
      window.removeEventListener('resize', imgResize);
    };
  }, [aspect]);

  const imgSizeInit = () => {
    const img = new Image();
    img.addEventListener('load', () => {
      imageSizeRef.current.width = img.width;
      imageSizeRef.current.height = img.height;
      const imgRatio = img.width / img.height;
      let cropWidth = cropSize.width;
      let cropHeight = cropSize.height;
      let tempRatio;
      let tempImageSize;
      if (width === 0 && height === 0) {
        cropWidth = containerRef.current!.offsetWidth;
        cropHeight = cropWidth * aspect;
        setCropSize({ width: cropWidth, height: cropHeight });
      }
      const cropRatio = cropWidth / cropHeight;
      if (imgRatio > cropRatio) {
        tempRatio = img.height / cropHeight;
        tempImageSize = { width: img.width / tempRatio, height: cropHeight };
      } else {
        tempRatio = img.width / cropWidth;
        tempImageSize = { width: cropWidth, height: img.height / tempRatio };
      }
      setImageSize(tempImageSize);
      setRatio(tempRatio);
      initialCroppedAreaFunction(tempImageSize, tempRatio);
      imgResize();
    });
    img.src = src;
  };

  const imgResize = () => {
    if (width === 0 && height === 0) {
      cropInit();
      const imgRatio = imageSizeRef.current.width / imageSizeRef.current.height;
      const cropWidth = containerRef.current!.offsetWidth;
      const cropHeight = cropWidth * aspect;
      const cropRatio = cropWidth / cropHeight;
      let tempImageSize;
      let tempRatio;
      if (imgRatio > cropRatio) {
        tempRatio = imageSizeRef.current.height / cropHeight;
        tempImageSize = { width: imageSizeRef.current.width / tempRatio, height: cropHeight };
      } else {
        tempRatio = imageSizeRef.current.width / cropWidth;
        tempImageSize = { width: cropWidth, height: imageSizeRef.current.height / tempRatio };
      }
      setCropSize({ width: cropWidth, height: cropHeight });
      setImageSize(tempImageSize);
      setRatio(tempRatio);
      emitCropData(tempImageSize, { width: cropWidth, height: cropHeight }, tempRatio);
    }
  };

  const initialCroppedAreaFunction = (tempImageSize: Size, tempRatio: number) => {
    setCompleteInitial(true);
    if (initialCroppedArea === undefined) return;
    const { initialCrop, initialZoom } = getInitialCropFromCroppedAreaPixels(
      initialCroppedArea,
      cropSize,
      tempImageSize,
      tempRatio,
    );
    zoomRef.current = initialZoom;
    cropRef.current = initialCrop;
    setCrop(() => cropRef.current);
  };

  const cropInit = () => {
    cropRef.current.x = 0;
    cropRef.current.y = 0;
    zoomRef.current = 1;
    setCrop((crop: Point) => ({ ...crop, x: 0, y: 0 }));
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
    setCrop(() => cropRef.current);
    onTouch.current = false;
  };

  const emitCropData = (
    imageSizeProps = imageSize,
    cropSizeProps = cropSize,
    ratioProps = ratio,
  ) => {
    const cropX =
      (((imageSizeProps.width * zoomRef.current - cropSizeProps.width) / 2 - cropRef.current.x) *
        ratioProps) /
      zoomRef.current;
    const cropY =
      (((imageSizeProps.height * zoomRef.current - cropSizeProps.height) / 2 - cropRef.current.y) *
        ratioProps) /
      zoomRef.current;
    const cropWidth = (cropSizeProps.width * ratioProps) / zoomRef.current;
    const cropHeight = (cropSizeProps.height * ratioProps) / zoomRef.current;
    const emitCropSize = {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    };
    onCropComplete(emitCropSize);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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
    const newPosition = restrictPosition(requestedPosition, cropSize, imageSize, zoomRef.current);
    const newFlexiblePosition = flexiblePosition(
      requestedPosition,
      cropSize,
      imageSize,
      zoomRef.current,
    );
    setCrop(newFlexiblePosition);
    cropRef.current = newPosition;
  };

  const setNewZoom = (zoom: number, point: Point) => {
    const zoomPoint = getPointOnContainer(point);
    const zoomTarget = getPointOnMedia(zoomPoint);
    const newZoom = clamp(zoom, minZoom, maxZoom);
    const requestedPosition = {
      x: zoomTarget.x * newZoom - zoomPoint.x,
      y: zoomTarget.y * newZoom - zoomPoint.y,
    };
    const newPosition = restrictPosition(requestedPosition, cropSize, imageSize, newZoom);
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
    onTouch.current = true;
    if (e.touches.length === 2) {
      onPinchStart(e);
    } else if (e.touches.length === 1) {
      onDragStart(getTouchPoint(e.touches[0]));
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    // Prevent whole page from scrolling on iOS.
    if (e.cancelable) e.preventDefault();
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
    if (rafDragTimeout.current != null) window.cancelAnimationFrame(rafDragTimeout.current);

    rafDragTimeout.current = window.requestAnimationFrame(() => {
      if (x === undefined || y === undefined) return;
      if (!onTouch.current) return;
      const requestedPosition = {
        x: x - dragStartPosition.current.x,
        y: y - dragStartPosition.current.y,
      };

      const newPosition = restrictPosition(requestedPosition, cropSize, imageSize, zoomRef.current);
      const newFlexiblePosition = flexiblePosition(
        requestedPosition,
        cropSize,
        imageSize,
        zoomRef.current,
      );
      setCrop(newFlexiblePosition);
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

    if (rafPinchTimeout.current != null) window.cancelAnimationFrame(rafPinchTimeout.current);
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
        width: `${
          width === 0 ? (aspect > 1 ? `${100 / aspect}%` : '100%') : `${cropSize.width}px`
        }`,
        height: `${cropSize.height === 0 ? '100%' : `${cropSize.height}px`}`,
        cursor: `${onEvent ? 'grabbing' : 'grab'}`,
      }}
    >
      <div
        className="cropper-image"
        ref={imageRef}
        style={{
          width: `${imageSize.width}px`,
          height: `${imageSize.height}px`,
          backgroundImage: `url(${src})`,
          transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoomRef.current})`,
          transition: `transform ${onEvent ? '0' : completeInitial ? '0' : '0.2'}s`,
          opacity: `${completeInitial ? '1' : '0'}`,
        }}
      />
      <div className="cropper-area" style={{ display: `${onEvent ? 'block' : 'none'}` }} />
    </div>
  );
};
export default Cropper;
