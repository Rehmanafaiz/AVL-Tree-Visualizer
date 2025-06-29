
"use client";

import React, { useState, useTransition } from 'react';
import { TreeConfigForm, type TreeConfig } from '@/components/tree-config-form';
import { TreeView } from '@/components/tree-view';
import { FrequencyReport } from '@/components/frequency-report';
import { FrequencyComparisonPlot, type PlotDataPoint } from '@/components/frequency-comparison-plot';
import { 
  type TreeNode, 
  bstTotalInsertFrequency, 
  avlTotalInsertFrequency,
  getTraversalFrequency,
  getTreeHeightForFrequency,
  generateRandomValues
} from '@/lib/tree';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';


interface GeneratedTreeData {
  id: string;
  originalValues: number[];
  bstRoot: TreeNode | null;
  avlRoot: TreeNode | null;
  bstInsertionFrequency: number;
  avlInsertionFrequency: number;
  traversalFrequency: number;
  numNodes: number; 
  bstActualHeight: number;
  avlActualHeight: number;
}

export default function TreeVisualizerClient() {
  const [generatedData, setGeneratedData] = useState<GeneratedTreeData[]>([]);
  const [insertionPlotData, setInsertionPlotData] = useState<PlotDataPoint[]>([]);
  const [traversalPlotData, setTraversalPlotData] = useState<PlotDataPoint[]>([]);
  const [heightPlotData, setHeightPlotData] = useState<PlotDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, startTransition] = useTransition();

  const handleFormSubmit = (configs: TreeConfig[]) => {
    setError(null);
    setGeneratedData([]);
    setInsertionPlotData([]);
    setTraversalPlotData([]);
    setHeightPlotData([]);

    startTransition(() => {
      try {
        const newGeneratedDataList: GeneratedTreeData[] = [];
        const newInsertionPlotPoints: PlotDataPoint[] = [];
        const newTraversalPlotPoints: PlotDataPoint[] = [];
        const newHeightPlotPoints: PlotDataPoint[] = [];

        for (const config of configs) {
          const numNodes = parseInt(config.numNodesStr, 10);
          let values: number[];

          if (config.inputType === 'random') {
            if (numNodes <=0) {
                 values = []; 
            } else {
                values = generateRandomValues(numNodes);
            }
          } else {
            values = config.valuesStr.split(',').map(v => parseInt(v.trim(), 10));
            if (values.some(isNaN)) {
              throw new Error(`Invalid numbers in manual input for Tree Set with ${numNodes} nodes.`);
            }
          }

          const { root: bstRoot, frequency: bstInsertionFrequency } = bstTotalInsertFrequency(values);
          const { root: avlRoot, frequency: avlInsertionFrequency } = avlTotalInsertFrequency(values);
          const traversalFreq = getTraversalFrequency(values.length);
          
          const bstActualHeight = getTreeHeightForFrequency(bstRoot);
          const avlActualHeight = getTreeHeightForFrequency(avlRoot);
          
          newGeneratedDataList.push({
            id: config.id,
            originalValues: values,
            bstRoot,
            avlRoot,
            bstInsertionFrequency,
            avlInsertionFrequency,
            traversalFrequency: traversalFreq,
            numNodes: values.length,
            bstActualHeight,
            avlActualHeight,
          });

          if (values.length > 0) {
            newInsertionPlotPoints.push({
              numNodes: values.length,
              metric1: bstInsertionFrequency,
              metric2: avlInsertionFrequency,
            });
            newTraversalPlotPoints.push({
                numNodes: values.length,
                metric1: traversalFreq, 
                metric2: traversalFreq, 
            });
            newHeightPlotPoints.push({
                numNodes: values.length,
                metric1: bstActualHeight,
                metric2: avlActualHeight,
            });
          }
        }
        
        const sortPlotData = (data: PlotDataPoint[]) => data.sort((a,b) => a.numNodes - b.numNodes);
        newGeneratedDataList.sort((a,b) => a.numNodes - b.numNodes);

        setGeneratedData(newGeneratedDataList);
        setInsertionPlotData(sortPlotData(newInsertionPlotPoints));
        setTraversalPlotData(sortPlotData(newTraversalPlotPoints));
        setHeightPlotData(sortPlotData(newHeightPlotPoints));

      } catch (err: any) {
        setError(err.message || "An error occurred during processing.");
        console.error("Processing error:", err);
      }
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <TreeConfigForm onSubmit={handleFormSubmit} isProcessing={isProcessing} />

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedData.length > 0 && (
        <div className="space-y-8">
          {generatedData.map((data, index) => (
            <Card key={data.id} className="shadow-xl overflow-hidden">
              <CardHeader className="bg-secondary/50">
                <CardTitle className="text-2xl font-semibold text-primary">
                  Tree Set {index + 1} <span className="text-muted-foreground text-lg">({data.numNodes} Nodes)</span>
                </CardTitle>
                <CardDescription>Comparison of BST and AVL tree structures and operation frequencies.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-6">
                <FrequencyReport
                  bstInsertionFrequency={data.bstInsertionFrequency}
                  avlInsertionFrequency={data.avlInsertionFrequency}
                  traversalFrequency={data.traversalFrequency}
                  originalValues={data.originalValues}
                  numNodes={data.numNodes}
                  bstTreeHeight={data.bstActualHeight}
                  avlTreeHeight={data.avlActualHeight}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TreeView coreTreeRoot={data.bstRoot} title="Binary Search Tree (BST)" />
                  <TreeView coreTreeRoot={data.avlRoot} title="AVL Tree" />
                </div>
              </CardContent>
              {index < generatedData.length -1 && <Separator className="my-4" />}
            </Card>
          ))}

          {insertionPlotData.length > 0 && (
            <FrequencyComparisonPlot 
                plotData={insertionPlotData} 
                plotTitle="Insertion Operations vs. Number of Nodes"
                line1Name="BST Insertion Ops"
                line2Name="AVL Insertion Ops"
            />
          )}
          {traversalPlotData.length > 0 && (
             <FrequencyComparisonPlot 
                plotData={traversalPlotData}
                plotTitle="In-Order Traversal Operations vs. Number of Nodes"
                line1Name="BST Traversal Ops" 
                line2Name="AVL Traversal Ops" 
            />
          )}
           {heightPlotData.length > 0 && (
             <FrequencyComparisonPlot 
                plotData={heightPlotData}
                plotTitle="Tree Height (Recursive Stack Depth) vs. Number of Nodes"
                line1Name="BST Height" 
                line2Name="AVL Height" 
            />
          )}
        </div>
      )}
       {isProcessing && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="bg-card p-8 rounded-lg shadow-2xl text-center">
              <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-medium text-foreground">Processing Trees...</p>
              <p className="text-sm text-muted-foreground">Please wait a moment.</p>
            </div>
          </div>
        )}
    </div>
  );
}
