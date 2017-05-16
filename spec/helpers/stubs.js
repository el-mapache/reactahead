import { spy } from 'sinon';

// is this really a 'stub'?
const stubKeyPressEvent = (keyCode = '90') => {
  return {
    keyCode,
    preventDefault: spy()
  };
}

export default stubKeyPressEvent;
