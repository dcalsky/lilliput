function getResult(a, b, c) {
  a = parseInt(a);
  b = parseInt(b);
  c = parseInt(c);
  let sum = 0;
  sum = 25 * a + 30 * b + 45 * c;
  let extract = 0;
  if (sum <= 1000) extract = sum * 0.1;
  else if (sum > 1000 && sum <= 1800) extract = (sum - 1000) * 0.15 + 1000 * 0.1;
  else if (sum > 1800) extract = (sum - 1800) * 0.2 + 800 * 0.15 + 1000 * 0.1;
  return extract;
}

describe('salary', () => {
  let dataset = readCSV('salary.csv');
  dataset = dataset.slice(1);
  dataset.forEach((grid, i) => {
    if (!grid || grid.length < 4) return;
    it(`should return commision:${grid[3]} when input is: ${[grid[0], grid[1], grid[2]]}`, () => {
      assert.equal(getResult(grid[0], grid[1], grid[2]), parseFloat(grid[3]));
    });
  });
});
