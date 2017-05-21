import React from 'react';
import proxyquire from 'proxyquire';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { spy } from 'sinon';

proxyquire.noCallThru();

const nodeOfSpy = spy();
const changeSpy = spy();
const focusSpy = spy();

const Fixture = proxyquire('../../src/search-input', {
  './utils/node-of': nodeOfSpy
}).default;
const defaultProps = {
  doAutoFocus: false,
  isFocused: false,
  name: 'my-input',
  onBlur: focusSpy,
  onChange: changeSpy,
  onFocus: focusSpy,
  value: ''
};

describe('<SearchInput />', () => {
  let component;

  beforeEach(() => {
    component = shallow(<Fixture {...defaultProps} />);
  });

  it('renders an <input /> element', () => {
    expect(component.find('input')).to.have.length(1);
  });

  it('passes the correct props to its input', () => {
    const instance = component.instance();
    const expectedProps = {
      autoComplete: 'off',
      autoFocus: defaultProps.doAutoFocus,
      className: 'reactahead-inline-input',
      name: defaultProps.name,
      onChange: defaultProps.onChange,
      onBlur: instance.onFocusChange,
      onFocus:instance.onFocusChange,
      type: 'text',
      value: defaultProps.value
    };

    expect(component.props()).to.deep.equal(expectedProps);
  });

  it('calls its onChange handler when the input updates', () => {
    component.simulate('change', 's');

    expect(changeSpy.calledWithExactly('s')).to.be.true;
  });

  it('correctly reports its focus state', () => {
    component.simulate('focus', { type: 'focus' });
    expect(focusSpy.calledWith(true)).to.be.true;

    component.simulate('blur', { type: 'blur' });
    expect(focusSpy.calledWith(false)).to.be.true;
  });

  // pending until I figure out the correct way to test this
  xit('calls its focus handlers when focus changes in props', () => {
    spy(component.instance(), 'onFocusChange');
    component.setProps({ isFocused: true });
    component.update();
    component.instance().componentDidUpdate(defaultProps);

    expect(nodeOfSpy.calledWithExactly(component.instance())).to.be.true;
    expect(focusSpy.calledWithExactly(true)).to.be.true;
  });
});
