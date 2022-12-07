import '@testing-library/jest-dom';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import { configure } from 'enzyme';
import React from 'react';

React.useLayoutEffect = React.useEffect;
configure({ adapter: new Adapter() });
