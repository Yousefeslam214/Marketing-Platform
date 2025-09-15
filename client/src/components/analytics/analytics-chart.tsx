import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const mockData = [
  { date: "Jan 1", impressions: 12000, clicks: 600 },
  { date: "Jan 2", impressions: 19000, clicks: 950 },
  { date: "Jan 3", impressions: 15000, clicks: 750 },
  { date: "Jan 4", impressions: 25000, clicks: 1250 },
  { date: "Jan 5", impressions: 22000, clicks: 1100 },
  { date: "Jan 6", impressions: 30000, clicks: 1500 },
  { date: "Jan 7", impressions: 28000, clicks: 1400 },
];

export function AnalyticsChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            className="text-sm text-muted-foreground"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            className="text-sm text-muted-foreground"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="impressions" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
            name="Impressions"
          />
          <Line 
            type="monotone" 
            dataKey="clicks" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
            name="Clicks"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
