import { expect } from 'chai';
import KeyCodes from '../../../src/utils/key-codes';

describe('KeyCodes', () => {
  it('defines `esc`, `up`, and `down`', () => {
    expect(KeyCodes.ESC).to.equal(27);
    expect(KeyCodes.DOWN).to.equal(40);
    expect(KeyCodes.UP).to.equal(38);
  });
});
