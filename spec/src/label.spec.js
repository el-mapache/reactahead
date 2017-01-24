import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import Label from '../../src/label';
import { defaultText } from '../../src/label';

const props = {
  fieldName: 'query',
  labelText: 'You too can type'
};

describe('<Label /> component', () => {
  it('renders a label tag', () => {
    const component = shallow(<Label />);

    expect(component.find('label')).to.have.length(1);
  });

  it('provides default label text', () => {
    const component = shallow(<Label />);

    expect(component.find('label').text()).to.equal(defaultText);
  });

  it('renders with supplied field name and label text', () => {
    const component = shallow(<Label {...props} />);
      expect(component.find('label').text()).to.equal(props.labelText);
      expect(component.find('label').prop('htmlFor')).to.equal(props.fieldName);
  });
});
