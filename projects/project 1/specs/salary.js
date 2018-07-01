function getResult(a, b, c) {
  let sum = 0;
  sum = 25 * a + 30 * b + 45 * c;
  let extract = 0;
  if (sum <= 1000) extract = sum * 0.1;
  else if (sum > 1000 && sum <= 1800) extract = (sum - 1000) * 0.15 + 1000 * 0.1;
  else if (sum > 1800) extract = (sum - 1800) * 0.2 + 800 * 0.15 + 1000 * 0.1;
  return extract;
}

describe('triangle', () => {
  let dataset = readCSV('triangle.csv');
  dataset = dataset.slice(1);
  dataset.forEach((grid, i) => {
    if (!grid || grid.length < 4) return;
    it(`Test ${i}`, () => {
      console.log(getTriangle(grid[0], grid[1], grid[2]), grid[3]);
      assert.equal(getTriangle(grid[0], grid[1], grid[2]), parseInt(grid[3]));
    });
  });
});
