import * as ReactDOM from 'react-dom';
import Cropper from '@components/Cropper';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Cropper src="/2521.jpg" width={600} height={600} />, div);
});
