
"use client";

import type * as React from 'react';
import { 
  type VisualTreeNode, 
  NODE_RADIUS, 
  getTreeDimensions,
  prepareTreeForVisual,
  X_SPACING, // Base horizontal spacing
  Y_SPACING, // Vertical spacing between levels
  DX_MULTIPLIER, // Horizontal spread reduction factor for children
  type TreeNode as CoreTreeNode
} from '@/lib/tree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TreeViewProps {
  coreTreeRoot: CoreTreeNode | null; // The raw tree data
  title: string; // Title for the card (e.g., "Binary Search Tree")
  className?: string; // Optional additional class names
}

// Component to draw a line between two nodes in the SVG tree
const TreeLine = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" />
);

// Component to render a single node in the SVG tree
const TreeNodeVisual = ({ node }: { node: VisualTreeNode }) => (
  <g transform={`translate(${node.x}, ${node.y})`}>
    <circle cx="0" cy="0" r={NODE_RADIUS} fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
    <text
      x="0"
      y="0"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
      fill="hsl(var(--card-foreground))" 
      className="pointer-events-none select-none" // Prevent text selection/interaction
    >
      {node.data}
    </text>
    {/* Display subtree height and balance factor below the node */}
    <text
      x="0"
      y={NODE_RADIUS + 14} 
      textAnchor="middle"
      fontSize="10"
      fill="hsl(var(--foreground))"
      className="pointer-events-none select-none"
    >
      H={node.subtreeHeight}, BF={node.balanceFactor}
    </text>
  </g>
);

/**
 * TreeView component renders a graphical representation of a tree (BST or AVL).
 * It takes the core tree data, transforms it for visualization, and then renders
 * nodes and connecting lines using SVG.
 */
export function TreeView({ coreTreeRoot, title, className }: TreeViewProps) {
  
  // Prepare the core tree data for visual rendering by assigning coordinates and IDs.
  // Starts positioning from a default x=0, y, and initial horizontal displacement (dx).
  const visualTreeRoot = coreTreeRoot ? prepareTreeForVisual(coreTreeRoot, 0, NODE_RADIUS + 25, X_SPACING * 2.5) : null;

  // Calculate the overall dimensions needed for the SVG canvas to fit the tree.
  const { minX, width, height } = visualTreeRoot 
    ? getTreeDimensions(visualTreeRoot) 
    : { minX: 0, width: 200, height: 150 }; // Default dimensions for empty tree
  
  // Define the SVG viewBox based on calculated dimensions, adding some padding.
  const viewBox = `${minX - 20} 0 ${width + 40} ${height + 20}`;

  const elements: React.ReactNode[] = [];
  if (visualTreeRoot) {
    // Perform a Breadth-First Traversal (BFS-like) to collect nodes and lines for rendering.
    // This ensures parent lines are typically rendered before children nodes.
    const q: VisualTreeNode[] = [visualTreeRoot];
    while (q.length > 0) {
      const current = q.shift()!;
      elements.push(<TreeNodeVisual key={current.id} node={current} />);
      
      // If left child exists, create a line to it and add child to queue.
      if (current.left) {
        elements.push(
          <TreeLine
            key={`${current.id}-left-line`}
            x1={current.x}
            y1={current.y + NODE_RADIUS} // Line starts from bottom of parent node
            x2={current.left.x}
            y2={current.left.y - NODE_RADIUS} // Line ends at top of child node
          />
        );
        q.push(current.left as VisualTreeNode);
      }
      // If right child exists, create a line to it and add child to queue.
      if (current.right) {
        elements.push(
          <TreeLine
            key={`${current.id}-right-line`}
            x1={current.x}
            y1={current.y + NODE_RADIUS}
            x2={current.right.x}
            y2={current.right.y - NODE_RADIUS}
          />
        );
        q.push(current.right as VisualTreeNode);
      }
    }
  }

  return (
    <Card className={cn("shadow-lg w-full", className)}>
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-xl text-center text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 min-h-[200px] flex items-center justify-center">
        {visualTreeRoot ? (
          <svg
            viewBox={viewBox}
            width="100%"
            height={Math.min(500, height + 20)} // Max height for SVG container to prevent excessive size
            preserveAspectRatio="xMidYMin meet" // Maintain aspect ratio and alignment
            className="transition-all duration-500 ease-in-out" // Smooth transition for re-renders
          >
            {elements}
          </svg>
        ) : (
          <p className="text-muted-foreground">No tree data to display.</p>
        )}
      </CardContent>
    </Card>
  );
}

// Utility function to combine class names, similar to ShadCN's utils.
// Useful for conditionally applying Tailwind classes.
function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
