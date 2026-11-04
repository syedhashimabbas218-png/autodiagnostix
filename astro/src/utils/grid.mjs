// Column classes for card grids whose item count comes from the CMS, chosen
// so rows fill evenly where possible (no lone card on the last row).
// Literal class strings keep them visible to Tailwind's scanner.
export function cardGridCols(count) {
  if (count <= 1) return 'max-w-md';
  if (count === 2) return 'sm:grid-cols-2 lg:max-w-4xl';
  if (count === 3) return 'md:grid-cols-3';
  if (count % 4 === 0) return 'sm:grid-cols-2 xl:grid-cols-4';
  if (count % 3 === 0) return 'md:grid-cols-3';
  if (count % 2 === 0) return 'sm:grid-cols-2';
  // 5, 7, 11, ...: a remainder is unavoidable at some width; 3 columns
  // leaves the smallest gap on laptops, and long lists use 4 on desktops.
  return count > 8 ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';
}
