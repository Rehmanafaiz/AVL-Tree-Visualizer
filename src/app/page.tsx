import TreeVisualizerClient from '@/components/tree-visualizer-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tree Visualizer GUI | BST vs AVL',
  description: 'Visualize and compare Binary Search Trees (BST) and AVL Trees. Analyze operation frequencies based on node count and input values.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Tree<span className="text-accent">Visualizer</span>GUI
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-foreground/80 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Interactively generate, visualize, and compare BST and AVL trees.
          Explore their structures and operational frequencies.
        </p>
      </header>
      <TreeVisualizerClient />
      <footer className="text-center mt-12 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          TreeVisualizerGUI &copy; {new Date().getFullYear()}. Inspired by concepts of Data Structures & Algorithms (DSA) and Design & Analysis of Algorithms (DAA).
        </p>
      </footer>
    </main>
  );
}
