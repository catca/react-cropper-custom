import Cropper from '../src/components/Cropper';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Cropper/Img',
  component: Cropper,
} as ComponentMeta<typeof Cropper>;

const Template: ComponentStory<typeof Cropper> = ({ src, width, height, onCropComplete }) => (
  <Cropper src={src} width={width} height={height} onCropComplete={onCropComplete}/>
);

export const Primary = Template.bind({});
