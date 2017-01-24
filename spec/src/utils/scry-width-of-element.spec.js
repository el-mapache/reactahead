import { expect } from 'chai';
import scryWidthOfElement from '../../../src/utils/scry-width-of-element';

const fakeHtmlEl = {
  getBoundingClientRect() {
    return { width: 100 };
  }
};

describe('#scryWidthOfElement', () => {
  it('returns 0 if the supplied argument is not an HTMLElement', () => {
    expect(scryWidthOfElement('string')).to.equal(0);
  });

  it('returns the width of the supplied HTMLElement as a number', () => {
    const output = scryWidthOfElement(fakeHtmlEl);

    expect(output).to.equal(100);
    expect(typeof output).to.equal('number');
  });
});
