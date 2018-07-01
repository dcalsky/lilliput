function calcWeek(year, month, day) {
  year = parseInt(year);
  month = parseInt(month);
  day = parseInt(day);
  if (year <= 0 || year > 2050 || month <= 0 || month > 12 || day <= 0 || day > 31) {
    return 0;
  }

  if (month < 3) {
    year -= 1;
    month += 12;
  }
  const b = [7, 1, 2, 3, 4, 5, 6];
  let c = parseInt(year / 100),
    y = year - 100 * c;
  let w = parseInt(c / 4) - 2 * c + y + parseInt(y / 4) + parseInt((26 * (month + 1)) / 10) + day - 1;
  w = ((w % 7) + 7) % 7;
  return b[w];
}

describe('calendar', () => {
  const dataset = readCSV('calendar.csv');
  dataset.forEach((grid, i) => {
    if (!grid || grid.length < 4) return;
    it(`should return result:${grid[3]} when input is: ${[grid[0], grid[1], grid[2]]}`, () => {
      assert.equal(calcWeek(grid[0], grid[1], grid[2]), parseInt(grid[3]));
    });
  });
});
