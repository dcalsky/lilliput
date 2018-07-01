function getRent(n, m) {
  n = parseInt(n);
  m = parseInt(m);
  const BASE_RENT = 25;
  const EACH_MIN = 0.15;
  let discount = 1;
  if (n < 0 || m < 0) {
    return -1;
  }
  if (n <= 60 && m <= 1) {
    discount = 1;
  } else if (n <= 120 && m <= 2) {
    discount = 1.5;
  } else if (n <= 180 && m <= 3) {
    discount = 2.0;
  } else if (n <= 300 && m <= 3) {
    discount = 2.5;
  } else if (m <= 6) {
    discount = 3.0;
  } else {
    return -1;
  }
  return (1 - discount / 100) * EACH_MIN * n + BASE_RENT;
}

describe('rent', () => {
  let dataset = readCSV('rent.csv');
  dataset = dataset.slice(1);
  dataset.forEach((grid, i) => {
    if (!grid || grid.length < 2) return;
    it(`should return ${grid[2]} when input is: ${[grid[0], grid[1], grid[2]]}`, () => {
      assert.equal(getRent(grid[0], grid[1]).toFixed(2), parseFloat(grid[2]).toFixed(2));
    });
  });
});
