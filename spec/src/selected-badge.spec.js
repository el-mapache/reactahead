import React from 'react';
import SelectedBadge from '../../src/selected-badge';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { spy } from 'sinon';

const props = {
  item: 'brillobox',
  index: 1
};

const fixture = (addtlProps = {}) =>
  shallow(<SelectedBadge {...Object.assign({}, props, addtlProps)} />);

describe('<SelectedBadge />', () => {
  let component;
  let clickSpy;

  beforeEach(() => {
    clickSpy = spy();
    component = fixture({ onClick: clickSpy });
  });

  it('exists as a component', () => {
    expect(component).to.exist;
  });

  context('rendered children', () => {
    it('renders a button', () => {
      expect(component.find('button')).to.have.length(1);
    });

    it('renders the supplied item text', () => {
      expect(component.contains(props.item)).to.be.true;
    });

    it('renders a close icon in a span', () => {
      expect(component.find('span')).to.have.length(1);
      expect(component.find('span').contains('x')).to.be.true;
    });
  });

  context('component operation', () => {
    describe('.onClick', () => {
      it('calls its onClick handler from props, passing index', () => {
        component.simulate('click');
        expect(clickSpy.calledOnce).to.be.true;
        expect(clickSpy.getCall(0).args).to.deep.equal([1]);
      });
    });
  });
});
