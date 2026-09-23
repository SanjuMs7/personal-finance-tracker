import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import { isSameMonth, withSpend } from '@/lib/calculations/budget';
import { formatMonthYearLabel } from '@/lib/formatting/datetime';
import type { Category, CategoryLimit, Expense } from '@/types';

function toRupees(paise: number): number {
  return Math.round((paise / 100) * 100) / 100;
}

export async function exportExcel(
  categories: Category[],
  expenses: Expense[],
  limits: CategoryLimit[],
  monthAnchor: number = Date.now()
): Promise<string> {
  const monthLabel = formatMonthYearLabel(monthAnchor);
  const catRows = withSpend(categories, expenses, limits, monthAnchor);

  // Scoped to the month the totals describe; the full history gets its own sheet
  // below, so the numbers in one sheet always match the rows beside them.
  const monthExpenses = expenses.filter((e) => isSameMonth(e.expenseDate, monthAnchor));

  const toRow = (e: Expense) => {
    const category = categories.find((c) => c.id === e.categoryId);
    const d = new Date(e.expenseDate);
    return {
      Date: d.toLocaleDateString('en-IN'),
      Time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      Expense: e.name,
      Category: category?.name ?? 'Uncategorized',
      'Amount (INR)': toRupees(e.amount),
    };
  };

  const expenseRows = monthExpenses
    .slice()
    .sort((a, b) => b.expenseDate - a.expenseDate)
    .map(toRow);

  const allExpenseRows = expenses
    .slice()
    .sort((a, b) => b.expenseDate - a.expenseDate)
    .map(toRow);

  const categoryRows = catRows.map((c) => ({
    Category: c.name,
    'Monthly Limit (INR)': c.monthlyLimit != null ? toRupees(c.monthlyLimit) : 'No limit',
    'Total Spent (INR)': toRupees(c.spent),
    'Remaining (INR)': c.monthlyLimit != null ? toRupees(c.monthlyLimit - c.spent) : '—',
    'Budget Usage %': c.monthlyLimit != null ? c.percent : '—',
  }));

  const totalSpent = catRows.reduce((sum, c) => sum + c.spent, 0);
  const totalBudget = catRows.reduce((sum, c) => sum + (c.monthlyLimit ?? 0), 0);
  const summaryRows = [
    { Metric: 'Month', Value: monthLabel },
    { Metric: 'Total Spending (INR)', Value: toRupees(totalSpent) },
    { Metric: 'Total Budget (INR)', Value: toRupees(totalBudget) },
    { Metric: 'Total Remaining (INR)', Value: toRupees(totalBudget - totalSpent) },
  ];

  const workbook = XLSX.utils.book_new();

  const expensesSheet = XLSX.utils.json_to_sheet(expenseRows);
  expensesSheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 26 }, { wch: 16 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, expensesSheet, monthLabel);

  const categoriesSheet = XLSX.utils.json_to_sheet(categoryRows);
  categoriesSheet['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 24 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Every expense ever recorded, so the file doubles as a full backup.
  const allSheet = XLSX.utils.json_to_sheet(allExpenseRows);
  allSheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 26 }, { wch: 16 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, allSheet, 'All Expenses');

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' }) as string;

  const stamp = new Date(monthAnchor);
  const fileName = `pocket-${stamp.getFullYear()}-${String(stamp.getMonth() + 1).padStart(2, '0')}.xlsx`;
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(base64, { encoding: 'base64' });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: `Export ${monthLabel} (Excel)`,
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  }

  return file.uri;
}
