function nextday(m, d, y) {
  y = parseInt(y);
  m = parseInt(m);
  d = parseInt(d);
  let leap;
  if (m == 2) {
    if (y % 400 == 0) leap = 1;
    else if (y % 100 == 0) leap = 0;
    else if (y % 4 == 0) leap = 1;
    else leap = 0;

    if (leap == 1) {
      if (d <= 28) {
        d++;
      } else if (d == 29) {
        m = 3;
        d = 1;
      }
    } else if (leap == 0) {
      if (d <= 27) d++;
      else if (d == 28) {
        d = 1;
        m = 3;
      }
    } else {
      return '-1';
    }
  } else if (m == 12) {
    if (d <= 30) {
      d++;
    } else if (d == 31) {
      y++;
      m = 1;
      d = 1;
    } else {
      return '-1';
    }
  } else if (m == 4 || m == 6 || m == 9 || m == 11) {
    if (d <= 29) d++;
    else if (d == 30) {
      m++;
      d = 1;
    }
  } else if (d <= 30) {
    d++;
  } else if (d == 31) {
    m++;
    d = 1;
  } else {
    return '-1';
  }

  return `${y}-${m}-${d}`;
}

describe('nextday', () => {
  let dataset = readCSV('nextday.csv');
  dataset = dataset.slice(1);
  dataset.forEach((grid, i) => {
    if (!grid || grid.length < 4) return;
    it(`should return result:${grid[3]} when input is: ${[grid[0], grid[1], grid[2]]}`, () => {
      assert.equal(nextday(grid[0], grid[1], grid[2]), grid[3]);
    });
  });
});
