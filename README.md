# react-cropper-custom

A React component to crop images with interactions.

<img alt="cropper" src="./public/cropper.gif" width="340" height="340"/>

## language

[Korean](https://github.com/catca/react-cropper-custom/blob/main/public/README.md)

## Demo

Check out the examples:

- [Basic example with hooks](https://codesandbox.io/s/react-cropper-custom-demo-tre3mh?file=/src/App.tsx)
- [Responsive cropper example with hooks](https://codesandbox.io/s/react-cropper-custom-responsive-iil3rm)

## Features

- Supports drag, zoom interactions.
- The image is automatically enlarged to fit the crop area.

## Installation

```shell
yarn add react-cropper-custom
```

or

```shell
npm install react-cropper-custom --save
```

## Basic usage

```js
import { Cropper } from 'react-cropper-custom';

const Demo = () => {
  const [zoom, setZoom] = useState(1);

  const onCropComplete = (croppedArea) => {
    console.log(croppedArea);
  };

  return (
    <Cropper
      src={yourImage}
      width={WIDTH}
      height={HEIGHT}
      zoom={zoom}
      onZoomChange={setZoom}
      onCropComplete={onCropComplete}
    />
  );
};
```

## Props

| Prop                                    | Type                                                  | Required | Description                                                                                                                                                                                     |
| :-------------------------------------- | :---------------------------------------------------- | :------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`                                   | string                                                |    ✔     | The image to be cropped. `src` is required.                                                                                                                                                     |
| `width`                                 | number                                                |          | Size of the crop area (in pixels). Defaults to 0. If the width and height values are 0, the crop area is responsive. It also follows the proportions of aspect props.                           |
| `height`                                | number                                                |          | Size of the crop area (in pixels). Defaults to 0. If the width and height values are 0, the crop area is responsive. It also follows the proportions of aspect props.                           |
| `aspect`                                | number                                                |          | Aspect of the crop area (height / width). Defaults to 1.                                                                                                                                        |
| `zoom`                                  | number                                                |          | Zoom of the media between `minZoom` and `maxZoom`. Defaults to 1.                                                                                                                               |
| `minZoom`                               | number                                                |          | Minimum zoom of the media. Defaults to 1.                                                                                                                                                       |
| `maxZoom`                               | number                                                |          | Maximum zoom of the media. Defaults to 3.                                                                                                                                                       |
| `onZoomChange`                          | zoom => void                                          |          | Called everytime the zoom is changed. Use it to update your `zoom` state.                                                                                                                       |
| `initialCroppedArea`                    | {x: number, y: number, width: number, height: number} |          | Use this to set the initial crop position/zoom of the cropper (for example, when editing a previously cropped media). The value should be the same as the croppedArea passed to onCropComplete. |
| [`onCropComplete`](#onCropCompleteProp) | Function                                              |    ✔     | Called when the user stops moving the media or stops zooming. It will be passed the corresponding cropped area on the media in pixels and image.                                                |

#### onCropComplete(croppedArea)

This callback is the one you should use to save the cropped area of the media. It's passed 1 arguments:

1. `croppedArea`: coordinates and dimensions of the cropped area in percentage of the media dimension.

croppedArea argument have the following shape:

```js
const croppedArea = {
  x: number, // x/y are the coordinates of the top/left corner of the cropped area
  y: number,
  width: number, // width of the cropped area
  height: number, // height of the cropped area
};
```

## Examples

### responsive cropper

```js
import { Cropper, getCroppedImg } from 'react-cropper-custom';

const Demo = () => {
  const [img, setImg] = useState(yourImage);
  const [aspect, setAspect] = useState(1);

  const onCropComplete = async (croppedArea) => {
    try {
      const image = await getCroppedImg(yourImage, croppedArea, { width: 1200, height: 1200 * aspect });
      setImg(image);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="wrapper">
      <Cropper
        src={yourImage}
        aspect={aspect}
        onCropComplete={onCropComplete}
      />
    <div>
  );
};
```

```css
.wrapper {
  width: 100%;
  max-width: 540px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## License

MIT

## Maintainers

This project is maintained by catca.
