const assert = require('assert');

describe('test2', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal([1, 2, 3].indexOf(3), -1);
    });
  });

  describe('#indexO123213213213f()', () => {
    it('1', () => {
      assert.equal([1, 2, 3].indexOf(3), -1);
    });

    it('2', () => {
      assert.equal([1, 2, 3].indexOf(1), -1);
    });

    it('3', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});
