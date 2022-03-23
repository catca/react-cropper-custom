import { Point, Size, Area } from '@src/types';

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function restrictPositionCoord(position: number, imageSize: number, mediaSize: number, zoom: number): number {
  const maxPosition = (mediaSize * zoom) / 2 - imageSize / 2;

  return clamp(position, -maxPosition, maxPosition);
}

/**
 * Ensure a new media position stays in the crop area.
 */
export function restrictPosition(position: Point, cropSize: Size, imageSize: Size, zoom: number): Point {
  return {
    x: restrictPositionCoord(position.x, cropSize.width, imageSize.width, zoom),
    y: restrictPositionCoord(position.y, cropSize.height, imageSize.height, zoom),
  };
}

export function getDistanceBetweenPoints(pointA: Point, pointB: Point) {
  return Math.sqrt((pointA.y - pointB.y) * (pointA.y - pointB.y) + (pointA.x - pointB.x) * (pointA.x - pointB.x));
}

/**
 * Return the point that is the center of point a and b
 */
export function getCenter(a: Point, b: Point): Point {
  return {
    x: (b.x + a.x) / 2,
    y: (b.y + a.y) / 2,
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} image - Image File url
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 */
export default function getCroppedImg(imageSrc: string, pixelCrop: Area): string {
  const image = new Image();
  image.src = imageSrc;
  image.crossOrigin = 'Anonymous';
  const canvas = document.createElement('canvas');
  const WIDTH = 1200;
  const HEIGHT = 1200;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, WIDTH, HEIGHT);

  // As Base64 string
  return canvas.toDataURL('image/jpeg');

  // As a blob
  // return new Promise((resolve, reject) => {
  //     canvas.toBlob(file => {
  //         resolve(URL.createObjectURL(file))
  //     }, 'image/jpeg')
  // })
}
