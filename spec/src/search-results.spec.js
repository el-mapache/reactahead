import React from 'react';
import proxyquire from 'proxyquire';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { spy } from 'sinon';

proxyquire.noCallThru();

const SearchResult = () => <div></div>;
const nodeOfStub = component => component;
const selectSpy = spy();

const Fixture = proxyquire('../../src/search-results', {
  './utils/nodeOf': nodeOfStub,
  './search-result': SearchResult
}).default;

const baseProps = {
  elements: ['Stanley', 'Andrei', 'François'],
  focusedIndex: 1,
  onSelect: selectSpy,
  width: 400
};

describe('<SearchResults />', () => {
  let component;

  context('with base props', () => {
    beforeEach(() => {
      component = shallow(<Fixture {...baseProps} />);
    });

    it('renders a ul', () => {
      expect(component.find('ul')).to.have.length(1);
    });

    it('derives its width from props, setting it in `px`', () => {
      const targetPx = `${baseProps.width}px`;

      expect(component.find('ul').prop('style').width).to.equal(targetPx);
    });

    it('defaults to being hidden', () => {
      expect(component.find('ul').prop('style').display).to.equal('none');
    });

    it('renders a <SearchResult/> for each element in props', () => {
      expect(component.find(SearchResult)).to.have.length(3);
    });

    it('passes the correct props to <SearchResult />', () => {
      const instance = component.instance();
      const child = component.childAt(0);
      const actualProps = child.props();
      const expectedProps = {
        index: 0,
        content: baseProps.elements[0],
        subcontent: undefined,
        focused: false,
        shouldScrollToView: instance.shouldScrollToView,
        onSelect: instance.props.onSelect
      };

      expect(actualProps).to.deep.equal(expectedProps);
    });
  });

  context('with visible true', () => {
    it('exposes itself', () => {
      const theProps = Object.assign({}, baseProps, { visible: true });
      const component = shallow(<Fixture {...theProps} />);

      expect(component.find('ul').prop('style').display).to.equal('block');
    });
  });

  context('with elements that are objects', () => {
    it('passes the content and subcontent to <SearchResult/>', () => {
      const elements = [{
        name: 'stalker',
        text: 'into the zone'
      }];
      const theProps = Object.assign({}, baseProps, { elements });
      const component = shallow(<Fixture {...theProps} />);
      const childProps = component.find(SearchResult).props();

      expect(childProps.content).to.equal(elements[0].name);
      expect(childProps.subcontent).to.equal(elements[0].text);
    });
  });
});
