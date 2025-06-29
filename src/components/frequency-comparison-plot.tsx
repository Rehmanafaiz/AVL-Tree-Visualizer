
"use client";

import type * as React from 'react';
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartConfig } from "@/components/ui/chart"

export interface PlotDataPoint {
  numNodes: number;
  metric1: number; // Was bstFreq
  metric2: number; // Was avlFreq
}

interface FrequencyComparisonPlotProps {
  plotData: PlotDataPoint[];
  plotTitle: string;
  line1Name: string;
  line2Name: string;
}

export function FrequencyComparisonPlot({ plotData, plotTitle, line1Name, line2Name }: FrequencyComparisonPlotProps) {
  
  const chartConfig = {
    metric1: { // Corresponds to line1Name
      label: line1Name,
      color: "hsl(var(--chart-1))",
    },
    metric2: { // Corresponds to line2Name
      label: line2Name,
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;
  
  if (plotData.length === 0) {
    return (
       <Card className="shadow-xl mt-6">
        <CardHeader>
          <CardTitle className="text-xl text-center text-primary">{plotTitle}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Not enough data for comparison plot.</p>
        </CardContent>
      </Card>
    );
  }

  const sortedData = [...plotData].sort((a,b) => a.numNodes - b.numNodes);

  let yAxisDisplayLabel: string;
  if (plotTitle.includes("Recursive Stack Depth")) {
    yAxisDisplayLabel = "Tree Height / Stack Depth";
  } else if (plotTitle.includes("Height")) {
    yAxisDisplayLabel = "Tree Height";
  } else {
    yAxisDisplayLabel = "Total Operations";
  }

  const allowYAxisDecimals = !(plotTitle.includes("Height") || plotTitle.includes("Recursive Stack Depth"));

  return (
    <Card className="shadow-xl mt-6">
      <CardHeader>
        <CardTitle className="text-xl text-center text-primary">{plotTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={sortedData}
            margin={{ top: 5, right: 30, left: 60, bottom: 80 }} // Increased left margin for Y-axis label
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="numNodes"
              type="number"
              stroke="hsl(var(--foreground))"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toString()}
              label={{ value: 'Number of Nodes (n)', position: 'bottom', offset: 25, fill: "hsl(var(--foreground))" }}
              name="Nodes"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              stroke="hsl(var(--foreground))"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleString()}
              label={{
                value: yAxisDisplayLabel,
                angle: -90,
                position: 'insideLeftTop',
                offset: 20, 
                dx: -25, 
                fill: "hsl(var(--foreground))"
              }}              
              domain={['auto', 'auto']}
              tickCount={7}
              allowDecimals={allowYAxisDecimals}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: "hsl(var(--muted))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              labelFormatter={(label) => `Nodes: ${label}`}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{
                color: "hsl(var(--foreground))",
                paddingTop: "40px" 
              }}
            />
            <Line
                type="monotone"
                dataKey="metric1"
                stroke={chartConfig.metric1.color}
                name={chartConfig.metric1.label}
                activeDot={{ r: 6 }}
                strokeWidth={2}
            />
            <Line
                type="monotone"
                dataKey="metric2"
                stroke={chartConfig.metric2.color}
                name={chartConfig.metric2.label}
                activeDot={{ r: 6 }}
                strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
