# react-cropper-custom

A React component to crop images with easy interactions

## Demo

Check out the examples:

- [Basic example with hooks](https://codesandbox.io/s/react-cropper-custom-demo-tre3mh?file=/src/App.tsx)

## Features

- Supports drag, zoom interactions
- The image is automatically enlarged to fit the area.

## Installation

```shell
yarn add react-easy-crop
```

or

```shell
npm install react-easy-crop --save
```

## Basic usage

```js
import Cropper from 'react-easy-crop';

const Demo = () => {
  const [zoom, setZoom] = useState(1);

  const onCropComplete = useCallback((croppedArea, croppedImage) => {
    console.log(croppedArea, croppedImage);
  }, []);

  return (
    <Cropper
      src={yourImage}
      width={WIDTH}
      height={HEIGHT}
      zoom={zoom}
      onCropComplete={onCropComplete}
      onZoomChange={setZoom}
    />
  );
};
```

## Props

| Prop                                    | Type         | Required | Description                                                                                                                                     |
| :-------------------------------------- | :----------- | :------: | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`                                   | string       |    ✔     | The image to be cropped. `src` is required.                                                                                                     |
| `zoom`                                  | number       |    ✔     | Zoom of the media between `minZoom` and `maxZoom`. Defaults to 1.                                                                               |
| `width`                                 | number       |    ✔     | Size of the crop area (in pixels).                                                                                                              |
| `height`                                | number       |    ✔     | Size of the crop area (in pixels).                                                                                                              |
| `onZoomChange`                          | zoom => void |          | Called everytime the zoom is changed. Use it to update your `zoom` state.                                                                       |
| [`onCropComplete`](#onCropCompleteProp) | Function     |          | Called when the user stops moving the media or stops zooming. It will be passed the corresponding cropped area on the media in pixels and image |

#### onCropComplete(croppedArea, croppedImg)

This callback is the one you should use to save the cropped area of the media. It's passed 2 arguments:

1. `croppedArea`: coordinates and dimensions of the cropped area in percentage of the media dimension
2. `croppedImg`: Cropped image based on cropArea(base64).

croppedArea argument have the following shape:

```js
const croppedArea = {
  x: number, // x/y are the coordinates of the top/left corner of the cropped area
  y: number,
  width: number, // width of the cropped area
  height: number, // height of the cropped area
};
```

## License

MIT

## Maintainers

This project is maintained by Catca.
