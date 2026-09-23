import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { colorForIcon, withSpend } from '@/lib/calculations/budget';
import { formatMoney } from '@/lib/formatting/money';
import type { Category, CategoryLimit, Expense } from '@/types';

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function statusColor(status: string): string {
  if (status === 'danger') return '#EF4444';
  if (status === 'warning') return '#F5A623';
  return '#3A5CFF';
}

function buildReportHtml(categories: Category[], expenses: Expense[], limits: CategoryLimit[]): string {
  const monthAnchor = Date.now();
  const rows = withSpend(categories, expenses, limits, monthAnchor);
  const totalSpent = rows.reduce((s, c) => s + c.spent, 0);
  const totalBudget = rows.reduce((s, c) => s + (c.monthlyLimit ?? 0), 0);
  const remaining = totalBudget - totalSpent;
  const generatedOn = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const spendByCategory = rows
    .map((c) => ({ name: c.name, spent: c.spent, color: colorForIcon(c.icon) }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);
  const maxCategorySpend = Math.max(1, ...spendByCategory.map((c) => c.spent));

  const categoryBarsHtml = spendByCategory
    .map(
      (c) => `
      <div class="bar-row">
        <div class="bar-label"><span class="dot" style="background:${c.color}"></span>${esc(c.name)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(c.spent / maxCategorySpend) * 100}%;background:${c.color}"></div></div>
        <div class="bar-value">${formatMoney(c.spent)}</div>
      </div>`
    )
    .join('');

  const budgetRowsHtml = rows
    .filter((c) => c.monthlyLimit != null)
    .map(
      (c) => `
      <div class="budget-row">
        <div class="budget-top">
          <span class="budget-name">${esc(c.name)}</span>
          <span class="budget-amounts">${formatMoney(c.spent)} / ${formatMoney(c.monthlyLimit ?? 0)} · ${c.percent}%</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.min(c.percent, 100)}%;background:${statusColor(c.status)}"></div></div>
      </div>`
    )
    .join('');

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dailyTotals = new Array(daysInMonth).fill(0);
  expenses.forEach((e) => {
    const d = new Date(e.expenseDate);
    const now = new Date();
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      dailyTotals[d.getDate() - 1] += e.amount;
    }
  });
  const maxDaily = Math.max(1, ...dailyTotals);
  const dailyBarsHtml = dailyTotals
    .map((amount, i) => `<div class="day-bar" style="height:${Math.max(2, (amount / maxDaily) * 100)}%" title="Day ${i + 1}"></div>`)
    .join('');

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
      * { box-sizing: border-box; }
      body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; margin: 0; padding: 36px 40px; color: #14171F; background: #F5F6FA; }
      h1 { font-size: 22px; margin: 0 0 4px 0; }
      .muted { color: #7C818F; font-size: 12px; margin-bottom: 24px; }
      .stat-row { display: flex; gap: 14px; margin-bottom: 28px; }
      .stat-card { flex: 1; background: #fff; border-radius: 16px; padding: 18px; }
      .stat-label { font-size: 11px; color: #7C818F; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
      .stat-value { font-size: 22px; font-weight: 800; }
      section { background: #fff; border-radius: 16px; padding: 20px 22px; margin-bottom: 20px; }
      section h2 { font-size: 14px; margin: 0 0 16px 0; }
      .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
      .bar-label { width: 130px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
      .dot { width: 8px; height: 8px; border-radius: 4px; display: inline-block; }
      .bar-track { flex: 1; height: 10px; background: #EDEFF5; border-radius: 6px; overflow: hidden; }
      .bar-fill { height: 100%; border-radius: 6px; }
      .bar-value { width: 90px; text-align: right; font-size: 12px; font-weight: 700; }
      .budget-row { margin-bottom: 14px; }
      .budget-top { display: flex; justify-content: space-between; margin-bottom: 6px; }
      .budget-name { font-size: 13px; font-weight: 700; }
      .budget-amounts { font-size: 12px; font-weight: 600; color: #7C818F; }
      .day-chart { display: flex; align-items: flex-end; gap: 2px; height: 90px; }
      .day-bar { flex: 1; background: #3A5CFF; border-radius: 2px 2px 0 0; opacity: 0.85; }
    </style>
  </head>
  <body>
    <h1>Personal Finance Report</h1>
    <div class="muted">Generated on ${generatedOn}</div>

    <div class="stat-row">
      <div class="stat-card"><div class="stat-label">Total Spending</div><div class="stat-value">${formatMoney(totalSpent)}</div></div>
      <div class="stat-card"><div class="stat-label">Total Budget</div><div class="stat-value">${formatMoney(totalBudget)}</div></div>
      <div class="stat-card"><div class="stat-label">Remaining</div><div class="stat-value">${formatMoney(remaining)}</div></div>
    </div>

    <section>
      <h2>Category Spending</h2>
      ${categoryBarsHtml || '<div class="muted">No expenses recorded this month.</div>'}
    </section>

    <section>
      <h2>Budget Spending</h2>
      ${budgetRowsHtml || '<div class="muted">No categories with a monthly limit yet.</div>'}
    </section>

    <section>
      <h2>Monthly Spending</h2>
      <div class="day-chart">${dailyBarsHtml}</div>
    </section>
  </body>
  </html>`;
}

export async function exportPdf(categories: Category[], expenses: Expense[], limits: CategoryLimit[]): Promise<string> {
  const html = buildReportHtml(categories, expenses, limits);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export Report (PDF)', UTI: 'com.adobe.pdf' });
  }

  return uri;
}
