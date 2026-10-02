import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface IncomeExpenseChartProps {
  currencySymbol: string;
  monthlyData: {
    month: string;
    income: number;
    expense: number;
    profit: number;
  }[];
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  currencySymbol,
  monthlyData,
}) => {
  const maxVal = Math.max(
    ...monthlyData.map((d) => Math.max(d.income, d.expense)),
    100000
  );

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center justify-end gap-5 mb-4 text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
          <span className="text-slate-600">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
          <span className="text-slate-600">Expenses</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-indigo-500 inline-block" />
          <span className="text-slate-600">Net Profit</span>
        </div>
      </div>

      {/* Bars container */}
      <div className="grid grid-cols-6 gap-2 sm:gap-4 h-56 pt-6 pb-2 items-end border-b border-slate-200">
        {monthlyData.map((data, idx) => {
          const incomeHeight = Math.min(100, Math.round((data.income / maxVal) * 100));
          const expenseHeight = Math.min(100, Math.round((data.expense / maxVal) * 100));
          const profitHeight = Math.min(
            100,
            Math.max(0, Math.round((data.profit / maxVal) * 100))
          );

          return (
            <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-16 bg-slate-900 text-white text-[11px] p-2 rounded shadow-lg z-20 whitespace-nowrap">
                <div className="font-semibold">{data.month}</div>
                <div className="text-emerald-300">Inc: {formatCurrency(data.income, currencySymbol)}</div>
                <div className="text-rose-300">Exp: {formatCurrency(data.expense, currencySymbol)}</div>
                <div className="text-indigo-300">Profit: {formatCurrency(data.profit, currencySymbol)}</div>
              </div>

              {/* Grouped Bars */}
              <div className="flex items-end justify-center gap-1 w-full h-full">
                {/* Income Bar */}
                <div
                  style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                  className="w-1/3 bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all"
                  title={`Income: ${formatCurrency(data.income, currencySymbol)}`}
                />
                {/* Expense Bar */}
                <div
                  style={{ height: `${Math.max(expenseHeight, 4)}%` }}
                  className="w-1/3 bg-rose-400 hover:bg-rose-500 rounded-t-sm transition-all"
                  title={`Expense: ${formatCurrency(data.expense, currencySymbol)}`}
                />
                {/* Profit Bar */}
                <div
                  style={{ height: `${Math.max(profitHeight, data.profit > 0 ? 4 : 0)}%` }}
                  className="w-1/3 bg-indigo-500 hover:bg-indigo-600 rounded-t-sm transition-all"
                  title={`Net Profit: ${formatCurrency(data.profit, currencySymbol)}`}
                />
              </div>

              <span className="text-[11px] text-slate-500 font-medium mt-2">
                {data.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
