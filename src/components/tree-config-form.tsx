
"use client";

import type * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Play } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface TreeConfig {
  id: string;
  numNodesStr: string;
  valuesStr: string;
  inputType: 'manual' | 'random';
  error?: string;
}

interface TreeConfigFormProps {
  onSubmit: (configs: TreeConfig[]) => void;
  isProcessing: boolean;
}

const MIN_TREES = 1;
const MAX_TREES = 20; 

// Simple ID generator as a fallback if crypto.randomUUID is problematic in some environments/parsers
const generateSimpleId = () => `config-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export function TreeConfigForm({ onSubmit, isProcessing }: TreeConfigFormProps) {
  const [numTreesStr, setNumTreesStr] = useState<string>('1');
  const [treeConfigs, setTreeConfigs] = useState<TreeConfig[]>([
    { id: generateSimpleId(), numNodesStr: '5', valuesStr: '', inputType: 'random' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Effect to adjust the number of tree configuration objects
  // based on the user's input for "Number of Tree Sets".
  useEffect(() => {
    const numTrees = parseInt(numTreesStr, 10);
    if (isNaN(numTrees) || numTrees < MIN_TREES || numTrees > MAX_TREES) {
      // If input is invalid, ensure configs array doesn't shrink below MIN_TREES
      // if it was already larger, or exceed MAX_TREES.
      if (treeConfigs.length !== 1 && (isNaN(numTrees) || numTrees < MIN_TREES)) {
        setTreeConfigs(prev => prev.slice(0, Math.max(MIN_TREES, Math.min(prev.length, MAX_TREES))));
      }
      return;
    }

    setTreeConfigs((prevConfigs) => {
      const newConfigs = [...prevConfigs];
      if (numTrees > newConfigs.length) {
        // Add new default configurations if numTrees increased
        for (let i = newConfigs.length; i < numTrees; i++) {
          newConfigs.push({ id: generateSimpleId(), numNodesStr: '5', valuesStr: '', inputType: 'random' });
        }
      } else if (numTrees < newConfigs.length) {
        // Remove configurations if numTrees decreased
        return newConfigs.slice(0, numTrees);
      }
      return newConfigs;
    });
  }, [numTreesStr, treeConfigs.length]); // Rerun when numTreesStr or the actual number of configs changes

  // Handles changes to the "Number of Tree Sets" input.
  const handleNumTreesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNumTreesStr(val);
    const num = parseInt(val, 10);
    if (isNaN(num) || num < MIN_TREES) {
      setFormError(`Number of trees must be at least ${MIN_TREES}.`);
    } else if (num > MAX_TREES) {
      setFormError(`Number of trees cannot exceed ${MAX_TREES}. Consider performance with many trees.`);
    } else {
      setFormError(null); // Clear error if valid
    }
  };

  // Updates a specific field of a specific tree configuration object.
  const updateTreeConfig = (index: number, field: keyof TreeConfig, value: string | 'manual' | 'random') => {
    setTreeConfigs((prev) =>
      prev.map((config, i) => (i === index ? { ...config, [field]: value, error: undefined } : config))
    );
  };

  // Handles the main form submission.
  // Validates all tree configurations before calling the onSubmit prop.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Reset general form error
    let isValidOverall = true;

    const validatedConfigs = treeConfigs.map(config => {
      const numNodes = parseInt(config.numNodesStr, 10);
      let currentConfigError: string | undefined = undefined;

      if (isNaN(numNodes) || numNodes <= 0) {
        isValidOverall = false;
        currentConfigError = 'Number of nodes must be a positive integer.';
      } else if (numNodes > 100 && config.inputType === 'manual') {
        isValidOverall = false;
        currentConfigError = 'Max 100 nodes for manual entry to ensure responsiveness.';
      } else if (numNodes > 50 && config.inputType === 'random') {
        isValidOverall = false;
        currentConfigError = 'Max 50 nodes for random generation to ensure performance.';
      }

      if (config.inputType === 'manual') {
        const values = config.valuesStr.split(',').map(v => v.trim()).filter(v => v !== '').map(v => parseInt(v, 10));
        if (values.some(isNaN)) {
          isValidOverall = false;
          currentConfigError = currentConfigError || 'All manual values must be integers.';
        }
        if (config.valuesStr.trim() === '' && numNodes > 0) {
            isValidOverall = false;
            currentConfigError = currentConfigError || `Please enter ${numNodes} comma-separated integer values.`;
        } else if (values.length !== numNodes && config.valuesStr.trim() !== '') {
           isValidOverall = false;
           currentConfigError = currentConfigError || `Expected ${numNodes} values, but got ${values.length}. Ensure comma-separated integers.`;
        }
      }
      return { ...config, error: currentConfigError };
    });

    setTreeConfigs(validatedConfigs);

    if (isValidOverall) {
      const finalConfigs = validatedConfigs.map(config => {
        // Ensure valuesStr is cleared if inputType is random, regardless of previous state
        if (config.inputType === 'random') {
          return { ...config, valuesStr: '' }; 
        }
        return config;
      });
      onSubmit(finalConfigs);
    } else {
      // If not valid overall, set a general form error to prompt user
      setFormError("Please correct errors in tree configurations.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Tree Visualizer Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="numTrees" className="text-lg font-medium">Number of Tree Sets to Compare:</Label>
            <Input
              id="numTrees"
              type="number"
              value={numTreesStr}
              onChange={handleNumTreesChange}
              min={MIN_TREES.toString()}
              max={MAX_TREES.toString()}
              className="text-base"
              aria-describedby="numTreesError"
            />
            {formError && <p id="numTreesError" className="text-sm text-destructive">{formError}</p>}
          </div>

          {treeConfigs.map((config, index) => (
            <Card key={config.id} className="p-4 bg-background/50 border-primary/20">
              <CardHeader className="p-2">
                <CardTitle className="text-xl text-primary/80">Tree Set {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-2">
                <div className="space-y-2">
                  <Label htmlFor={`numNodes-${index}`} className="font-medium">Number of Nodes:</Label>
                  <Input
                    id={`numNodes-${index}`}
                    type="number"
                    value={config.numNodesStr}
                    onChange={(e) => updateTreeConfig(index, 'numNodesStr', e.target.value)}
                    min="1"
                    max="100" // Max for both, specific validation in handleSubmit
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Input Type:</Label>
                  <RadioGroup
                    value={config.inputType}
                    onValueChange={(value: 'manual' | 'random') => {
                      updateTreeConfig(index, 'inputType', value);
                      if (value === 'random') {
                        // Clear manual values if switching to random
                        updateTreeConfig(index, 'valuesStr', ''); 
                      }
                    }}
                    className="flex gap-4 items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="random" id={`random-${index}`} />
                      <Label htmlFor={`random-${index}`}>Random</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id={`manual-${index}`} />
                      <Label htmlFor={`manual-${index}`}>Manual</Label>
                    </div>
                  </RadioGroup>
                </div>
                {config.inputType === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor={`values-${index}`} className="font-medium">Node Values (comma-separated integers):</Label>
                    <Input
                      id={`values-${index}`}
                      type="text"
                      value={config.valuesStr}
                      onChange={(e) => updateTreeConfig(index, 'valuesStr', e.target.value)}
                      placeholder="e.g., 10, 5, 15, 3, 7"
                      className="text-sm"
                    />
                  </div>
                )}
                 {config.error && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertTitle>Configuration Error</AlertTitle>
                        <AlertDescription>{config.error}</AlertDescription>
                    </Alert>
                )}
              </CardContent>
            </Card>
          ))}
          <CardFooter className="flex justify-center p-2 pt-6">
            <Button type="submit" className="w-full max-w-xs text-lg py-3 bg-primary hover:bg-primary/90" disabled={isProcessing}>
              {isProcessing ? (
                <>
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                Processing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" /> Visualize Trees
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
