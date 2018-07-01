function getPara(money, leaveDays, moneyRate) {
  money = parseInt(money);
  leaveDays = parseInt(leaveDays);
  moneyRate = parseFloat(moneyRate);
  let para = 0;

  if (money >= 200 && leaveDays <= 10) {
    if (moneyRate >= 0.6) para = 7;
    else para = 0;
  } else if (moneyRate <= 0.85) para = 6;
  else para = 5;

  return para;
}

describe('para', () => {
  let dataset = readCSV('para.csv');
  dataset = dataset.slice(1);
  dataset.forEach((grid, i) => {
    if (!grid || grid.length < 4) return;
    it(`should return result:${grid[3]} when input is: ${[grid[0], grid[1], grid[2]]}`, () => {
      assert.equal(getPara(grid[0], grid[1], grid[2]), parseInt(grid[3]));
    });
  });
});
