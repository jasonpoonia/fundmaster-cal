import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type MortgageBalanceChartProps = {
  mortgageBalanceData: any[];
  results: any[];
  formatCurrency: (value: number) => string;
};

export function MortgageBalanceChart({
  mortgageBalanceData,
  results,
  formatCurrency,
}: MortgageBalanceChartProps) {
  // Define consistent colors for each term
  const colors = {
    current: '#94a3b8',
    '6m': '#ef4444',
    '1y': '#f97316',
    '18m': '#f59e0b',
    '2y': '#84cc16',
    '3y': '#14b8a6',
    '4y': '#3b82f6',
    '5y': '#8b5cf6',
    'floating': '#ec4899',
    'Custom': '#8b5cf6'
  };

  // Define the order of terms for display
  const termOrder = ['6m', '1y', '18m', '2y', '3y', '4y', '5y', 'floating', 'Custom'];

  const getTermDisplay = (term: string) => {
    if (term === 'Custom') return 'Custom Rate';
    if (term === 'floating') return 'Floating';
    if (term.endsWith('y')) return `${term.replace('y', ' Year')}`;
    if (term.endsWith('m')) return `${term.replace('m', ' Month')}`;
    return term;
  };

  // Sort results according to the predefined order
  const sortedResults = [...results].sort((a, b) => {
    const indexA = termOrder.indexOf(a.term);
    const indexB = termOrder.indexOf(b.term);
    return indexA - indexB;
  });

  return (
    <div className="bg-white p-6 lg:p-8 rounded-lg shadow-sm">
      <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6">
        Mortgage Balance Over Time
      </h3>
      <div className="h-80 lg:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mortgageBalanceData}
            margin={{
              top: 20,
              right: 45,
              left: 45,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ 
                value: 'Years', 
                position: 'insideBottom', 
                offset: -5 
              }}
            />
            <YAxis
              label={{
                value: '',
                angle: -90,
                position: 'insideLeft',
                offset: 0,
              }}
              tickFormatter={(value) => `$${formatCurrency(value)}`}
            />
            <Tooltip 
              formatter={(value) => `$${formatCurrency(Number(value))}`}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="currentBalance"
              name="Current Rate"
              stroke={colors.current}
              strokeWidth={2}
            />
            {sortedResults.map((result) => (
              <Line
                key={result.term}
                type="monotone"
                dataKey={result.term}
                name={getTermDisplay(result.term)}
                stroke={colors[result.term] || colors.Custom}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}