import React from 'react';
import proxyquire from 'proxyquire';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { spy } from 'sinon';

proxyquire.noCallThru();

const scrollSpy = spy();
const clickSpy = spy();
const nodeOfSpy = (component) => component;

const SearchResult = proxyquire('../../src/search-result', {
  './utils/node-of': nodeOfSpy
}).default;

const basicProps = {
  shouldScrollToView: scrollSpy,
  content: 'option text',
  handleClick: clickSpy,
  index: 0,
  focused: false
};

describe('<SearchResult />', () => {
  let component;

  context('basic props', () => {
    beforeEach(() => {
      component = shallow(<SearchResult {...basicProps} />);
    });

    it('renders a li element', () => {
      expect(component.find('li')).to.have.length(1);
    });

    it('renders the correct text', () => {
      expect(component.find('strong').text()).to.equal(basicProps.content);
    });

    it('renders the correct base classes', () => {
      expect(component.hasClass('react-typeahead-result')).to.be.true;
    });

    it('calls the handleClick prop on click', () => {
      const { handleClick, index } = basicProps;

      component.simulate('click');
      expect(handleClick.calledWithExactly(index)).to.be.true;
    });

    it('doesnt call `shouldScrollToView` when it unfocused', () => {
      component.instance().checkShouldScroll(basicProps.focused);
      expect(basicProps.shouldScrollToView.calledOnce).not.to.be.true;
    });
  });

  context('when focused', () => {
    let props;

    beforeEach(() => {
      props = Object.assign({}, basicProps, { focused: true });
      component = shallow(<SearchResult {...props} />);
    });

    it('calls `shouldScrollIntoView`, passing itself and its index', () => {
      component.instance().checkShouldScroll(props.focused);

      const calledWith = basicProps.shouldScrollToView.calledWithExactly(component.instance(), props.index);

      expect(calledWith).to.be.true;
    });

    it('renders the text element with an additional `focused` class', () => {
      expect(component.find('li').hasClass('focused')).to.be.true;
    });
  });

  it('renders subcontent if supplied', () => {
    const props = Object.assign({}, basicProps, { subcontent: 'handy info' });

    component = shallow(<SearchResult {...props} />);
    expect(component.find('p')).to.have.length(1);
    expect(component.find('p').text()).to.equal('handy info');
  });

  it('subcontent has the correct classes when rendered', () => {
    expect(component.find('p').hasClass('react-typeahead-text truncate'));
  });
});
