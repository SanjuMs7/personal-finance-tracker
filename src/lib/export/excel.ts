import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import { withSpend } from '@/lib/calculations/budget';
import type { Category, Expense } from '@/types';

function toRupees(paise: number): number {
  return Math.round((paise / 100) * 100) / 100;
}

export async function exportExcel(categories: Category[], expenses: Expense[]): Promise<string> {
  const monthAnchor = Date.now();
  const catRows = withSpend(categories, expenses, monthAnchor);

  const expenseRows = expenses
    .slice()
    .sort((a, b) => b.expenseDate - a.expenseDate)
    .map((e) => {
      const category = categories.find((c) => c.id === e.categoryId);
      const d = new Date(e.expenseDate);
      return {
        Date: d.toLocaleDateString('en-IN'),
        Time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        Expense: e.name,
        Category: category?.name ?? 'Uncategorized',
        'Amount (INR)': toRupees(e.amount),
      };
    });

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
    { Metric: 'Total Spending (INR)', Value: toRupees(totalSpent) },
    { Metric: 'Total Budget (INR)', Value: toRupees(totalBudget) },
    { Metric: 'Total Remaining (INR)', Value: toRupees(totalBudget - totalSpent) },
  ];

  const workbook = XLSX.utils.book_new();

  const expensesSheet = XLSX.utils.json_to_sheet(expenseRows);
  expensesSheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 26 }, { wch: 16 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');

  const categoriesSheet = XLSX.utils.json_to_sheet(categoryRows);
  categoriesSheet['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 24 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' }) as string;

  const fileName = `personal-finance-${Date.now()}.xlsx`;
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(base64, { encoding: 'base64' });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export Expenses (Excel)',
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  }

  return file.uri;
}
