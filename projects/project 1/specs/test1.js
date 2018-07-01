function getTriangle(a, b, c) {
  a = parseInt(a)
  b = parseInt(b)
  c = parseInt(c)
  if (a + b <= c || a + c <= b || b + c <= a) {
    return 0;
  }
  if (a === b && a === c && b === c) {
    return 2;
  }
  if (a === b || a === c || b === c) {
    return 1;
  }
}

describe('triangle', () => {
  let dataset = readCSV('triangle.csv');
  dataset = dataset.slice(1);
  dataset.forEach((grid, i) => {
    
    if (!grid || grid.length < 4) return;
    it(`Test ${i}`, () => {
      console.log(getTriangle(grid[0], grid[1], grid[2]), grid[3])
      assert.equal(getTriangle(grid[0], grid[1], grid[2]),  parseInt(grid[3]));
    });
  });
});
