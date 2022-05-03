import React from 'react';
import * as ReactDOM from 'react-dom';
import Cropper from '@components/Cropper';
import { restrictPosition } from '@utils/Utils';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const onCropComplete = () => {};
  const onZoomChange = () => {};
  ReactDOM.render(
    <Cropper
      src="/2521.jpg"
      width={600}
      height={600}
      onCropComplete={onCropComplete}
      zoom={1}
      onZoomChange={onZoomChange}
    />,
    div,
  );
});

describe('Utils', () => {
  describe('restrictPosition', () => {
    test('position within the cropped area should be returned as-is', () => {
      const position = { x: 0, y: 0 };
      const cropSize = { width: 500, height: 500 };
      const imageSize = { width: 800, height: 500 };
      const zoom = 1;
      const result = restrictPosition(position, cropSize, imageSize, zoom);
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });
});
