import Cropper from '../src/components/Cropper';
import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Cropper/Img',
  component: Cropper,
} as ComponentMeta<typeof Cropper>;

const Template: ComponentStory<typeof Cropper> = (args) => (
  <Cropper src={args.src} width={args.width} height={args.height} />
);

export const Primary = Template.bind({});
