export function formatMoney(paise: number): string {
  const rupees = Math.round(paise / 100);
  return '₹' + rupees.toLocaleString('en-IN');
}

/** Drops a trailing .0 so 1.0k reads as 1k. */
function trim(value: number): string {
  const text = value.toFixed(1);
  return text.endsWith('.0') ? text.slice(0, -2) : text;
}

/**
 * Short enough for a chart label on a narrow column: ₹1.2k, ₹3.4L. Exact below
 * a thousand, where the full number is already short.
 */
export function formatMoneyCompact(paise: number): string {
  const rupees = Math.round(paise / 100);
  if (rupees < 1000) return '₹' + rupees;
  // Switch at the point the rounded thousands would read as 100, not at a flat
  // 100000, so "₹100k" never appears one rupee before "₹1L".
  const thousands = rupees / 1000;
  if (thousands < 99.95) return '₹' + trim(thousands) + 'k';
  return '₹' + trim(rupees / 100000) + 'L';
}

export function formatMoneyInput(paise: number): string {
  const rupees = paise / 100;
  return rupees % 1 === 0 ? String(rupees) : rupees.toFixed(2);
}
