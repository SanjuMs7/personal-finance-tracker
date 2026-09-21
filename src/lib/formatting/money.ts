export function formatMoney(paise: number): string {
  const rupees = Math.round(paise / 100);
  return '₹' + rupees.toLocaleString('en-IN');
}

export function formatMoneyInput(paise: number): string {
  const rupees = paise / 100;
  return rupees % 1 === 0 ? String(rupees) : rupees.toFixed(2);
}
