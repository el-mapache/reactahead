import React from 'react';
import proxyquire from 'proxyquire';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { spy, stub } from 'sinon';
import { defaultSearchName } from '../../src/index';

proxyquire.noCallThru();

const nodeOfStub = spy();
const scryWidthStub = spy();
const reportWidthSpy = spy();
const keyInputSpy = spy();
const focusSpy = spy();

const Fixture = proxyquire('../../src/search-bar', {
  './utils/node-of': nodeOfStub,
  './utils/scry-width-of-element': scryWidthStub
}).default;

const baseProps = {
  reportWidth: reportWidthSpy,
  doAutoFocus: true,
  name: defaultSearchName,
  onKeyInput: keyInputSpy,
  onFocus: focusSpy
};

describe('<SearchBar /> component', () => {
  let component;

  beforeEach(() => {
    component = shallow(<Fixture {...baseProps} />);
  });

  afterEach(() => {
    keyInputSpy.reset();
  });

  it('renders an input element', () => {
    expect(component.find('input')).to.exist;
  });

  it('delivers props to its components', () => {
    const instance = component.instance();
    const actualProps = component.find('input').props();
    const expectedProps = {
      type: 'text',
      name: defaultSearchName,
      onChange: instance.handleKeyInput,
      value: component.state().query,
      className: 'react-typeahead-input',
      autoFocus: baseProps.doAutoFocus,
      autoComplete: 'off',
      onFocus: instance.onFocusChange,
      onBlur: instance.onFocusChange
    };

    expect(actualProps).to.deep.equal(expectedProps);
  });

  it('updates its state when the user enters text', () => {
    component.simulate('change', {target: { value: 'z'} });
    expect(component.state('query')).to.equal('z');
  });

  it('calls the onKeyInput props when state updates' , () => {
    component.simulate('change', {target: { value: 'z'} });

    expect(keyInputSpy.calledWithExactly('z')).to.be.true;
    expect(keyInputSpy.called).to.be.true;
  });

  it('reports its width back to parent when screen size changes', () => {
    const instance = component.instance();
    const { onWindowResize } = instance;

    onWindowResize();

    expect(reportWidthSpy.calledOnce).to.be.true;
    expect(scryWidthStub.calledOnce).to.be.true;
    expect(nodeOfStub.calledOnce).to.be.true;
    expect(nodeOfStub.calledWithExactly(instance)).to.be.true;
  });

  it('correctly reports its focus state', () => {
    component.simulate('focus', {type: 'focus'});
    expect(baseProps.onFocus.calledWithExactly(true)).to.be.true;

    component.simulate('blur', {type: 'blur'});
    expect(baseProps.onFocus.calledWithExactly(false)).to.be.true;
  });
});
