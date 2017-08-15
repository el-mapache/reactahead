import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import inputProvider from '../../src/input-provider';

describe('inputProvider()', () => {
  const dummy = () => <div></div>;
  const Component = inputProvider(dummy);
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Component />);
  });

  it('contains the search query as state', () => {
    expect(wrapper.state('input')).to.exist;
    expect(wrapper.state('input')).to.equal('');
  });
});
