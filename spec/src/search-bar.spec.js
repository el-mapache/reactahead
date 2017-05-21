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
const unselectSpy = spy();
const SearchInput = () => <div></div>;
const SelectedBadge = () => <div></div>;

const triggerChildEvent = (component, method, data) =>
  component.props()[method].call(component, data);

const Fixture = proxyquire('../../src/search-bar', {
  './utils/node-of': nodeOfStub,
  './utils/scry-width-of-element': scryWidthStub,
  './search-input': SearchInput,
  './selected-badge': SelectedBadge
}).default;

const baseProps = {
  doAutoFocus: true,
  isFocused: false,
  name: defaultSearchName,
  onFocus: focusSpy,
  onKeyInput: keyInputSpy,
  onUnselect: unselectSpy,
  query: '',
  reportWidth: reportWidthSpy,
  selected: ['the white ribbon', 'amour']
};

describe('<SearchBar /> component', () => {
  let component;

  beforeEach(() => {
    component = shallow(<Fixture {...baseProps} />);
  });

  afterEach(() => {
    keyInputSpy.reset();
  });

  it('renders a wrapper for its children', () => {
    expect(component.find('.react-typeahead-input')).to.exist;
  });

  it('renders a <SearchInput/> element', () => {
    expect(component.find(SearchInput)).to.exist;
  });

  it('renders <SelectedBadge /> components for each selected item', () => {
    expect(component.find(SelectedBadge)).to.have.length(2);
  });

  context('when delivering props to its components', () => {
    let instance;

    beforeEach(() => {
      instance = component.instance();
    });

    it('supplies the correct props to the <SearchInput />', () => {
      const actualProps = component.find(SearchInput).props();
      const expectedProps = {
        name: defaultSearchName,
        onChange: instance.handleKeyInput,
        value: baseProps.query,
        autoFocus: baseProps.doAutoFocus,
        onFocus: baseProps.onFocus,
        onBlur: baseProps.onFocus,
        isFocused: baseProps.isFocused
      };

      expect(actualProps).to.deep.equal(expectedProps);
    });

    it('supplies the correct props to <SelectedBadge />', () => {
      const badgeIndex = 0;
      const badgeComponent = component.find(SelectedBadge).at(badgeIndex);
      const actualProps = badgeComponent.props();
      const expectedProps = {
        index: badgeIndex,
        item: baseProps.selected[badgeIndex],
        onClick: baseProps.onUnselect
      };

      expect(actualProps).to.deep.equal(expectedProps);
      expect(badgeComponent.node.key).to.equal(String(badgeIndex));
    });
  });

  it('calls the onKeyInput props when state updates' , () => {
    const input = component.find(SearchInput);
    triggerChildEvent(input, 'onChange', { target: { value: 'z'} });

    expect(keyInputSpy.calledWithExactly('z')).to.be.true;
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
});
