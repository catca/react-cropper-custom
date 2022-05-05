import type { Area, Point, Size } from '../types';

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function restrictPositionCoord(
  position: number,
  imageSize: number,
  mediaSize: number,
  zoom: number,
): number {
  const maxPosition = (mediaSize * zoom) / 2 - imageSize / 2;

  return clamp(position, -maxPosition, maxPosition);
}

/**
 * Ensure a new media position stays in the crop area.
 */
export function restrictPosition(
  position: Point,
  cropSize: Size,
  imageSize: Size,
  zoom: number,
): Point {
  return {
    x: restrictPositionCoord(position.x, cropSize.width, imageSize.width, zoom),
    y: restrictPositionCoord(position.y, cropSize.height, imageSize.height, zoom),
  };
}

function flexiblePositionCoord(
  position: number,
  imageSize: number,
  mediaSize: number,
  zoom: number,
): number {
  const maxPosition = (mediaSize * zoom) / 2 - imageSize / 2;
  if (position > maxPosition) return maxPosition + (position - maxPosition) ** 0.7;
  if (position < -maxPosition) return -maxPosition - (-(position + maxPosition)) ** 0.7;
  return position;
}

/**
 * Ensure a new flexible position stays in the crop area.
 */
export function flexiblePosition(
  position: Point,
  cropSize: Size,
  imageSize: Size,
  zoom: number,
): Point {
  return {
    x: flexiblePositionCoord(position.x, cropSize.width, imageSize.width, zoom),
    y: flexiblePositionCoord(position.y, cropSize.height, imageSize.height, zoom),
  };
}

export function getDistanceBetweenPoints(pointA: Point, pointB: Point) {
  return Math.sqrt(
    (pointA.y - pointB.y) * (pointA.y - pointB.y) + (pointA.x - pointB.x) * (pointA.x - pointB.x),
  );
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
 * Compute crop and zoom from the croppedAreaPixels
 */
export function getInitialCropFromCroppedAreaPixels(
  initialCroppedArea: Area,
  cropSize: Size,
  imageSize: Size,
  ratio: number,
): { initialCrop: Point; initialZoom: number } {
  const initialZoom = (cropSize.width * ratio) / initialCroppedArea.width;
  let initialCrop = {
    x:
      (imageSize.width * initialZoom - cropSize.width) / 2 -
      (initialZoom * initialCroppedArea.x) / ratio,
    y:
      (imageSize.height * initialZoom - cropSize.height) / 2 -
      (initialZoom * initialCroppedArea.y) / ratio,
  };
  initialCrop = restrictPosition(initialCrop, cropSize, imageSize, initialZoom);
  return { initialCrop, initialZoom };
}

export const createImage = async (url: string) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} image - Image File url
 * @param {Object} pixelCrop - pixelCrop Object
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  canvasSize: Size = {
    width: 1200,
    height: 1200,
  },
) {
  const image: any = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const WIDTH = canvasSize.width;
  const HEIGHT = canvasSize.height;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    WIDTH,
    HEIGHT,
  );

  // As Base64 string
  return canvas.toDataURL('image/jpeg');

  // As a blob
  // return new Promise((resolve, reject) => {
  //     canvas.toBlob(file => {
  //         resolve(URL.createObjectURL(file))
  //     }, 'image/jpeg')
  // })
}
