import { expect } from 'chai';

const expectStateIsTruthy = (component, prop) => {
  expect(component.state(prop)).to.be.true;
};

const expectStateIsFalsey = (component, prop) => {
  expect(component.state(prop)).to.be.false;
};

const setState = (component, obj) => {
  component.setState(obj);
  component.update();
};

const expectStateToBe = (component, prop, value) => {
  expect(component.state(prop)).to.eq(value);
}

export {
  expectStateIsTruthy,
  expectStateIsFalsey,
  expectStateToBe,
  setState
};
