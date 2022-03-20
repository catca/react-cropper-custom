import { CropperProps } from '@src/types';
import { FC } from 'react';
import './index.css';

const Cropper: FC<CropperProps> = (props: CropperProps) => {
  const { src, width, height } = props;
  return (
    <div className="cropper-container" style={{ width, height }}>
      <div className="cropper-image" style={{ width, height, backgroundImage: `url(${src})` }} />
      <div className="cropper-area" />
    </div>
  );
};
export default Cropper;
