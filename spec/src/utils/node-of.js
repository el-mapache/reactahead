import { expect } from 'chai';
import { spy } from 'sinon';
import proxyquire from 'proxyquire';

const theSpy = spy();

const fixture = proxyquire('../../../src/utils/node-of', {
  'react-dom': {
    findDOMNode: theSpy
  }
}).default;

describe('#nodeOf', () => {
  it('calls proxies calls to findDOMNode', () => {
    fixture();
    expect(theSpy.calledOnce).to.be.true
  });
});
