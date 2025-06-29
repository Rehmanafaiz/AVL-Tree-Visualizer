
"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FrequencyReportProps {
  bstInsertionFrequency: number;
  avlInsertionFrequency: number;
  traversalFrequency: number;
  originalValues: number[];
  numNodes: number;
  bstTreeHeight: number;
  avlTreeHeight: number;
}

export function FrequencyReport({ 
  bstInsertionFrequency, 
  avlInsertionFrequency, 
  traversalFrequency,
  originalValues,
  numNodes,
  bstTreeHeight,
  avlTreeHeight
}: FrequencyReportProps) {
  const sortedValues = [...originalValues].sort((a, b) => a - b);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-lg text-primary">Analysis for {numNodes} Nodes</CardTitle>
      </CardHeader>
      <CardContent className="text-sm px-4 pb-4">
        <div className="mb-3">
          <p><span className="font-semibold">Original Values:</span> {originalValues.join(', ')}</p>
          <p><span className="font-semibold">Sorted Values (for context):</span> {sortedValues.join(', ')}</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Metric</TableHead>
              <TableHead>Tree Type</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium" rowSpan={2}>Total Insertion Ops</TableCell>
              <TableCell>BST (Iterative)</TableCell>
              <TableCell className="text-right">{bstInsertionFrequency.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>AVL (Iterative)</TableCell>
              <TableCell className="text-right">{avlInsertionFrequency.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium" rowSpan={1}>Total Traversal Ops (In-Order, Recursive)</TableCell>
              <TableCell>BST / AVL</TableCell>
              <TableCell className="text-right">{traversalFrequency.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium" rowSpan={2}>Tree Height</TableCell>
              <TableCell>BST</TableCell>
              <TableCell className="text-right">{bstTreeHeight}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>AVL</TableCell>
              <TableCell className="text-right">{avlTreeHeight}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium" rowSpan={2}>Worst-Case Recursive Stack Depth</TableCell>
              <TableCell>BST</TableCell>
              <TableCell className="text-right">O({bstTreeHeight})</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>AVL</TableCell>
              <TableCell className="text-right">O({avlTreeHeight})</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-3">
          Note: Tree height reflects the longest path from root to leaf. Lower height (common in AVL trees)
          generally leads to faster average search, insertion, and deletion operations (O(log N) vs. O(N) in worst-case BSTs)
          and reduces stack space for recursive algorithms, mitigating stack overflow risks. Traversal operation count depends primarily on the number of nodes (N).
        </p>
      </CardContent>
    </Card>
  );
}
