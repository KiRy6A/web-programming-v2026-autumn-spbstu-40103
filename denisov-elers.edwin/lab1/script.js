const rows = document.querySelectorAll('tbody tr');
const totalCells = document.querySelectorAll('tfoot td');

let totalSold = 0;
let totalRevenue = 0;

rows.forEach((row) => {
  const cells = row.querySelectorAll('td');

  totalSold += Number(cells[1].textContent);
  totalRevenue += Number(cells[2].textContent);
});

totalCells[1].textContent = totalSold;
totalCells[2].textContent = totalRevenue;
