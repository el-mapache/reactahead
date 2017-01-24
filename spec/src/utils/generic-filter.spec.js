import { expect } from 'chai';
import genericFilter from '../../../src/utils/generic-filter';

const fakeQuery = 'ba';
const stringData = ['bad', 'burglar', 'basketball', 'cooking', 'cops'];
const objData = [
  {
    name: 'mystikal'
  },
  {
    name: 'twista'
  },
  {
    name: 'master p'
  }
];

describe('#genericFilter', () => {
  context('defaults', () => {
    it('returns an empty list when no search query is provided', () => {
      expect(genericFilter()).to.be.instanceOf(Array);
      expect(genericFilter()).to.be.empty;
    });

    it('returns an empty list if an initial list is not supplied', () => {
      expect(genericFilter(fakeQuery)).to.be.instanceOf(Array);
      expect(genericFilter()).to.be.empty;
    });
  })

  context('invalid input', () => {
    it('throws an error when the second argument is not an array', () => {
      [null, 'hi', {}, 1].forEach(badValue => {
        expect(genericFilter.bind(null, fakeQuery, badValue)).to.throw(Error);
      });
    });
  });

  it('converts all queries to strings', () => {
    const weirdData = ["[object object]", "null", "nan", "2"];

    expect(genericFilter({}, weirdData)).to.have.length(1)
    expect(genericFilter(2, weirdData)).to.have.length(1)
  });

  context('dataset of strings', () => {
    it('returns a filtered subset of the dataset based on search query', () => {
      expect(genericFilter(fakeQuery, stringData)).to.have.length(2);
    });
  });

  context('dataset of objects', () => {
    it('returns an empty list if a key isnt provided as the third param', () => {
      expect(genericFilter('m', objData)).to.have.length(0);
    });

    it('returns a filtered list when the key is present', () => {
      expect(genericFilter('m', objData, 'name')).to.have.length(2);
    })
  });
});
