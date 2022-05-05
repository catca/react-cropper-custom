# react-cropper-custom

이미지 자르기를 위한 리액트 컴포넌트.

<img alt="cropper" src="./cropper.gif" width="340" height="340"/>

## Demo

예시를 확인해보세요.

- [Basic example with hooks](https://codesandbox.io/s/react-cropper-custom-demo-tre3mh?file=/src/App.tsx)
- [Responsive cropper example with hooks](https://codesandbox.io/s/react-cropper-custom-responsive-iil3rm)

## Features

- 드래그, 확대 기능 지원합니다.
- 자르기 영역에 맞게 이미지가 자동으로 확대됩니다.
- 반응형을 지원합니다.

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
import { Cropper } from "react-cropper-custom";

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

| 요소                                    | 타입                                                  | 필수 | 설명                                                                                                                                                               |
| :-------------------------------------- | :---------------------------------------------------- | :--: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`                                   | string                                                |  ✔   | 자르려는 이미지 주소입니다.                                                                                                                                        |
| `width`                                 | number                                                |      | 자르기 영역의 너비입니다 (px). 기본 값은 0입니다. 만약 너비와 높이 값이 둘 다 0이라면, 자르기 영역은 반응형으로 동작합니다. 이 경우 aspect 요소의 비율을 따릅니다. |
| `height`                                | number                                                |      | 자르기 영역의 높이입니다 (px). 기본 값은 0입니다. 만약 너비와 높이 값이 둘 다 0이라면, 자르기 영역은 반응형으로 동작합니다. 이 경우 aspect 요소의 비율을 따릅니다. |
| `aspect`                                | number                                                |      | 자르기 영역의 비율입니다 (높이 / 너비). 기본 값은 1입니다.                                                                                                         |
| `zoom`                                  | number                                                |      | `minZoom`과 `maxZoom` 사이의 확대 비율입니다. 기본 값은 1입니다.                                                                                                   |
| `minZoom`                               | number                                                |      | 확대 비율의 최솟값입니다. 기본 값은 1입니다.                                                                                                                       |
| `maxZoom`                               | number                                                |      | 확대 비율의 최댓값입니다. 기본 값은 3입니다.                                                                                                                       |
| `onZoomChange`                          | zoom => void                                          |      | `zoom`이 변경 될 경우 호출됩니다. `zoom` 상태를 변경하는 함수를 넣어주세요. (예: setZoom)                                                                          |
| `initialCroppedArea`                    | {x: number, y: number, width: number, height: number} |      | 초기 자르기 위치와 확대 비율을 설정합니다(예: 이전에 자른 이미지를 편집할 때). `onCropComplete`에서 전달된 자른 영역과 같아야 합니다.                              |
| [`onCropComplete`](#oncropcompletecroppedarea) | Function                                              |  ✔   | 사용자가 드래그 또는 확대를 멈추면 호출 됩니다. 자른 이미지의 크기 및 좌표 값을 전달합니다.                                                                        |

#### onCropComplete(croppedArea)

잘린 영역을 저장하는 데 사용하는 콜백입니다. 1개의 인수를 가집니다:

1. `croppedArea`: 잘린 영역의 시작 좌표 및 너비, 높이.

`croppedArea` 인수의 형태:

```js
const croppedArea = {
  x: number, // x/y are the coordinates of the top/left corner of the cropped area
  y: number,
  width: number, // width of the cropped area
  height: number, // height of the cropped area
};
```

## Examples

### 반응형으로 자르기 영역 만들기

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
