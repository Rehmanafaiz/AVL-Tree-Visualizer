
export interface TreeNode {
  data: number;
  left: TreeNode | null; // Type is TreeNode | null
  right: TreeNode | null; // Type is TreeNode | null
  height: number; // AVL height property // +1 for property
}

export interface VisualTreeNode extends TreeNode {
  id: string; // +1 for property
  x: number; // +1 for property
  y: number; // +1 for property
  balanceFactor: number; // +1 for property
  subtreeHeight: number; // Actual structural height for visual layout // +1 for property
  // Override left and right from TreeNode to be of type VisualTreeNode | null
  left: VisualTreeNode | null; // +1 for property
  right: VisualTreeNode | null; // +1 for property
}

export const NODE_RADIUS = 20;
export const X_SPACING = 50;
export const Y_SPACING = 70;
export const DX_MULTIPLIER = 0.6; // Multiplier for horizontal displacement of children

/**
 * Creates a new tree node.
 * Each node stores its data, left/right children, and height (for AVL balancing).
 */
export function createTreeNode(key: number): TreeNode { // +1 for function def
  return { data: key, left: null, right: null, height: 1 }; // +1 for object literal, +4 assignments = 5 ops
}

/**
 * Gets the height of a node for AVL calculations.
 * Returns 0 for a null node, otherwise returns the node's stored height.
 */
export function getHeight(node: TreeNode | null): number { // +1 for function def
  if (!node) return 0; // +1 check, +1 return (if null) = 2 ops
  return node.height;  // +1 access, +1 return (if node) = 2 ops
}

/**
 * Calculates the balance factor of a node.
 * Balance factor = height(left child) - height(right child).
 */
export function getBalance(node: TreeNode | null): number { // +1 for function def
  if (!node) return 0; // +1 check, +1 return = 2 ops
  // Relies on getHeight calls, their ops are counted within those calls
  return getHeight(node.left) - getHeight(node.right); // +1 subtraction, +1 return = 2 ops (+ ops from getHeight calls)
}

/**
 * Performs a right rotation around node z.
 * This is a standard AVL tree rotation to rebalance the tree.
 * Assumes z and z.left are not null.
 *       z                            y
 *      / \                          / \
 *     y   T3  -> rightRotate(z) -> T1  z
 *    / \                              / \
 *   T1  T2                           T2  T3
 */
export function rightRotate(z: TreeNode): TreeNode { // +1 for function def
  const y = z.left!;       // +1 access, +1 assign = 2 ops
  const T3 = y.right;     // +1 access, +1 assign = 2 ops

  // Perform rotation
  y.right = z;            // +1 access, +1 assign = 2 ops
  z.left = T3;            // +1 access, +1 assign = 2 ops

  // Update heights - must be done bottom-up (z first, then y)
  z.height = 1 + Math.max(getHeight(z.left), getHeight(z.right)); // +1 assign, +1 add, +1 Math.max = 3 ops (+ ops from getHeight calls)
  y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right)); // +1 assign, +1 add, +1 Math.max = 3 ops (+ ops from getHeight calls)

  return y;               // +1 return
}

/**
 * Performs a left rotation around node z.
 * This is a standard AVL tree rotation to rebalance the tree.
 * Assumes z and z.right are not null.
 *     z                            y
 *    / \                          / \
 *   T1  y   -> leftRotate(z) ->   z  T3
 *      / \                      / \
 *     T2  T3                   T1  T2
 */
export function leftRotate(z: TreeNode): TreeNode { // +1 for function def
  const y = z.right!;     // +1 access, +1 assign = 2 ops
  const T2 = y.left;      // +1 access, +1 assign = 2 ops

  // Perform rotation
  y.left = z;             // +1 access, +1 assign = 2 ops
  z.right = T2;           // +1 access, +1 assign = 2 ops
  
  // Update heights - must be done bottom-up (z first, then y)
  z.height = 1 + Math.max(getHeight(z.left), getHeight(z.right)); // +1 assign, +1 add, +1 Math.max = 3 ops (+ ops from getHeight calls)
  y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right)); // +1 assign, +1 add, +1 Math.max = 3 ops (+ ops from getHeight calls)

  return y;               // +1 return
}

/**
 * Inserts a key into a Binary Search Tree (BST) iteratively.
 * Does not perform any balancing.
 */
export function insertBstIter(root: TreeNode | null, key: number): TreeNode { // +1 for function def
  const newNode = createTreeNode(key); // createTreeNode ops counted separately
  if (!root) { // +1 check
    return newNode; // +1 return
  }
  let current = root; // +1 assign
  // Loop for traversal to find insertion point.
  // In worst case (skewed tree or inserting at deepest leaf), iterates h_tree times.
  // Loop condition check runs h_tree + 1 times.
  while (true) { 
    if (key < current.data) { // +1 compare, +1 access
      if (!current.left) {    // +1 check, +1 access (of .left)
        current.left = newNode; // +1 access (of .left), +1 assign
        break;                // +1 break
      }
      current = current.left; // +1 access (of .left), +1 assign
    } else { // Assumes no duplicate keys; if key >= current.data, go right
      if (!current.right) {   // +1 check, +1 access (of .right)
        current.right = newNode; // +1 access (of .right), +1 assign
        break;                 // +1 break
      }
      current = current.right; // +1 access (of .right), +1 assign
    }
  }
  return root; // +1 return
}

/**
 * Inserts a key into an AVL tree iteratively and maintains its balance.
 * Involves a standard BST insertion followed by rebalancing up the path from the new node to the root.
 */
export function insertAvlIter(rootNode: TreeNode | null, key: number): TreeNode | null { // +1 for function def
  let root = rootNode; // +1 assign
  if (!root) { // +1 check
    return createTreeNode(key); // createTreeNode ops counted separately, +1 return
  }

  const stack: TreeNode[] = []; // Path tracking stack // +1 assign (array init)
  let current: TreeNode | null = root; // +1 assign

  // Phase 1: BST-like insertion and tracking the path.
  // Loop runs h_tree times to find insertion spot. Loop condition checks h_tree + 1 times.
  while (current) { 
    stack.push(current); // +1 push
    if (key < current.data) { // +1 compare, +1 access
      if (!current.left) { // +1 check, +1 access
        current.left = createTreeNode(key); // createTreeNode ops sep., +1 access, +1 assign
        stack.push(current.left); // Push the new node onto stack for Phase 2 // +1 push
        break; // +1 break
      }
      current = current.left; // +1 access, +1 assign
    } else { // Assumes no duplicate keys
      if (!current.right) { // +1 check, +1 access
        current.right = createTreeNode(key); // createTreeNode ops sep., +1 access, +1 assign
        stack.push(current.right); // Push the new node // +1 push
        break; // +1 break
      }
      current = current.right; // +1 access, +1 assign
    }
  }

  // Phase 2: Traverse up from the new node (or its parent) to the root,
  // updating heights and performing rotations if necessary.
  // Loop runs up to h_tree + 1 times (for new node and its ancestors).
  // Loop condition checks (h_tree + 1) + 1 times.
  while (stack.length > 0) { 
    let node = stack.pop()!; // +1 pop, +1 assign

    // Update height of the current node
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right)); // +1 assign, +1 add, +1 Math.max (+ ops from getHeight calls)
    
    // Get balance factor to check for imbalance
    const balance = getBalance(node); // +1 assign (+ ops from getBalance call)

    let newSubtreeRoot = node; // Stores the root of the (potentially) rebalanced subtree // +1 assign

    // Perform rotations if node is unbalanced
    // Left Left Case
    if (balance > 1 && key < node.left!.data) { // +1 compare (balance), +1 compare (key), +1 access (node.left), +1 access (.data)
      newSubtreeRoot = rightRotate(node); // rightRotate ops counted separately
    } 
    // Right Right Case
    else if (balance < -1 && key > node.right!.data) { // +1 compare (balance), +1 compare (key), +1 access (node.right), +1 access (.data)
      newSubtreeRoot = leftRotate(node); // leftRotate ops counted separately
    } 
    // Left Right Case
    else if (balance > 1 && key > node.left!.data) { // +1 compare (balance), +1 compare (key), +1 access (node.left), +1 access (.data)
      node.left = leftRotate(node.left!); // leftRotate ops sep., +1 access (node.left), +1 assign
      newSubtreeRoot = rightRotate(node); // rightRotate ops sep.
    } 
    // Right Left Case
    else if (balance < -1 && key < node.right!.data) { // +1 compare (balance), +1 compare (key), +1 access (node.right), +1 access (.data)
      node.right = rightRotate(node.right!); // rightRotate ops sep., +1 access (node.right), +1 assign
      newSubtreeRoot = leftRotate(node); // leftRotate ops sep.
    }

    // If a rotation occurred, the newSubtreeRoot might be different from 'node'.
    // We need to link it back to its parent in the stack.
    if (newSubtreeRoot !== node) { // +1 compare
      if (stack.length > 0) { // +1 check
        const parent = stack[stack.length - 1]; // +1 access (array), +1 assign
        if (parent.left === node) { // +1 access, +1 compare
          parent.left = newSubtreeRoot; // +1 access, +1 assign
        } else {
          parent.right = newSubtreeRoot; // +1 access, +1 assign
        }
      } else {
        // If stack is empty, newSubtreeRoot is the new overall root
        root = newSubtreeRoot; // +1 assign
      }
    }
  }
  return root; // +1 return
}


/**
 * Calculates the actual structural height of the tree (longest path from root to a leaf).
 * Used for visual representation and for determining path length for frequency ops.
 */
export function getTreeHeightForFrequency(node: TreeNode | null): number { // +1 function def
  if (!node) return 0; // +1 check, +1 return = 2 ops
  // +1 add, +1 Math.max (+ recursive call ops) for each node
  return 1 + Math.max(getTreeHeightForFrequency(node.left), getTreeHeightForFrequency(node.right)); 
}

/**
 * Estimates operations for iterative BST insertion.
 * 'h_tree' is the height of the tree *before* this insertion.
 * 'isRootNull' is true if the tree is currently empty.
 */
export function bstInsertFrequencyOps(h_tree: number, isRootNull: boolean): number {
  let ops = 0;
  ops += 5; // For createTreeNode
  ops += 1; // For the initial !root check in insertBstIter
  if (isRootNull) {
    ops += 1; // For the return newNode if root is null
    return ops;
  }
  ops += 1; // For 'let current = root;' assignment
  
  // Loop iterations: (h_tree + 1) path traversals in the while(true)
  // while(true) itself isn't counted as N+1, but the internal breaks/assignments define the path.
  // Each step down the tree involves:
  //   - key < current.data (2 ops: compare, access)
  //   - !current.left/right (2 ops: check, access)
  //   - assignment to current.left/right or current (2 ops)
  // This happens 'h_tree' times to reach the parent of the new leaf.
  ops += h_tree * (2 + 2 + 2); // Traversing h_tree levels
  
  // Final step to attach the new node:
  //   - key < current.data (2 ops)
  //   - !current.left/right (2 ops)
  //   - current.left/right = newNode (2 ops)
  //   - break (1 op)
  ops += (2 + 2 + 2 + 1);
  
  ops += 1; // For the final 'return root;'
  return ops;
}

/**
 * Estimates operations for iterative AVL insertion.
 * 'h_tree' is the height of the tree *before* this insertion.
 * 'isRootNull' is true if the tree is currently empty.
 * This is a more complex estimation due to the rebalancing phase.
 */
export function avlInsertFrequencyOps(h_tree: number, isRootNull: boolean): number {
  let ops = 0;
  // Initial part of insertAvlIter (before loops)
  ops += 5; // createTreeNode (though returned early if root is null)
  ops += 1; // 'let root = rootNode;'
  ops += 1; // '!root' check
  if (isRootNull) {
    ops += 1; // 'return createTreeNode(key)'
    return ops; 
  }
  ops += 1; // 'const stack = [];'
  ops += 1; // 'let current = root;'

  // Phase 1: BST-like insertion and path tracking (while (current) loop)
  // Iterates (h_tree + 1) times to insert and push new node onto stack.
  // Each iteration: stack.push (1), key < current.data (2), !current.left/right (2), assignment to current.left/right or current (2)
  ops += (h_tree + 1) * (1 + 2 + 2 + 2); 
  // Plus one 'break' (1 op) and one createTreeNode (5 ops) and one stack.push (1 op) for the new node.
  ops += 1 + 5 + 1; 

  // Phase 2: Rebalancing (while (stack.length > 0) loop)
  // Iterates (h_tree + 1) times (for new node and its ancestors).
  // Each iteration:
  ops += (h_tree + 1) * (
    2 +       // stack.pop() and assignment
    (1+1+1) + // node.height update (assign, add, Math.max) + (2 * ops for getHeight(leaf might be 2, internal node more)) - simplified as 3 base ops + getHeight calls
    (1 + 2) + // getBalance call ops (+ ops from getHeight calls within getBalance) - simplified as 1 assign + 2 for getBalance base ops
    1 +       // 'let newSubtreeRoot = node;'
    (4 * 4) + // Worst case 4 conditional checks for rotations (each ~4 ops: 2 compares, 2 accesses)
    1         // 'newSubtreeRoot !== node' compare
  );
  
  // Cost of rotations and parent relinking:
  // This is tricky as rotations don't always happen.
  // Assuming on average 1 rotation for simplicity in estimation (a very rough approx.)
  // Cost of one rotation (e.g., rightRotate): 2+2+2+2+3+3 = 14 ops (excluding internal getHeight calls)
  // Relinking parent: ~1 (check stack.length) + 2 (parent access) + 2 (parent.left/right === node) + 2 (parent.left/right assign) = 7 ops
  // Let's add a simplified cost if a rotation and relink occur (this is an average estimate)
  // This part makes it an estimation, not an exact equation for all cases.
  // A more accurate model would depend on the actual number of rotations triggered.
  // For a rough estimate, we can say that for each node on the path back up (h_tree+1),
  // there's a check for parent relinking.
  ops += (h_tree + 1) * (1 + 1 + 2 + 1); // Simplified parent relinking logic ops (if newSubtreeRoot !== node): stack.length, parent access, compare, assign.

  // The cost of actual calls to rightRotate/leftRotate (around 14 ops each) and getHeight/getBalance
  // are implicitly part of the structure. For simplicity, this model aggregates them.
  // A truly exact equation would be extremely complex and data-dependent.
  // This count focuses on the control flow and explicit assignments in insertAvlIter.

  ops += 1; // Final 'return root;'
  return ops;
}


/**
 * Calculates operations for a standard recursive traversal (In-Order, Pre-Order, Post-Order).
 * For N nodes, there are N calls that are not null and N+1 calls that are null (leaf children).
 * Recursive In-Order Traversal (example):
 *   inOrder(node) {
 *     if (node === null) return; // +2 ops (check, return) -> (N+1) times for null links
 *     inOrder(node.left);        // +1 op (recursive call) -> N times
 *     process(node.data);        // +1 op (data access/process) -> N times
 *     inOrder(node.right);       // +1 op (recursive call) -> N times
 *   }
 * Total ops: (N+1)*2 (for null checks) + N*1 (left calls) + N*1 (process) + N*1 (right calls)
 * = 2N + 2 + 3N = 5N + 2.
 * A slightly more detailed count for a typical recursive traversal:
 * For each non-null node (N times):
 *   1. Check if node is null (false) (+1 op)
 *   2. Recursive call for left child (+1 op)
 *   3. Visit/process node (+1 op, e.g., accessing data)
 *   4. Recursive call for right child (+1 op)
 * For each null link encountered (N+1 times for a binary tree with N nodes):
 *   1. Check if node is null (true) (+1 op)
 *   2. Return (+1 op)
 * Total: N*(1+1+1+1) + (N+1)*2 = 4N + 2N + 2 = 6N + 2.
 * Let's use a common textbook estimate: 3 main operations per node (visit, recurse left, recurse right) plus null checks.
 * If process is 1 op, each non-null call is ~ (check_null_false + recurse_L + visit + recurse_R) = 4 ops for N nodes = 4N
 * Each null call is ~ (check_null_true + return) = 2 ops for N+1 nulls = 2(N+1)
 * Total ~ 4N + 2N + 2 = 6N + 2. A constant for initial call setup can be added. Let's use 6N+4.
 */
export function getTraversalFrequency(numNodes: number): number { // +1 function def
  if (numNodes < 0) return 0; // +1 check, +1 return
  return 6 * numNodes + 4; // Simplified equation based on analysis
}


/**
 * Calculates the structural height of a subtree for visual layout purposes.
 * This is the traditional definition of tree height (number of edges on longest path from node to a leaf, or nodes-1).
 * A single node tree has height 0 by this definition (or 1 if counting nodes).
 * This implementation counts nodes, so a single node has height 1.
 */
export function getSubtreeHeightForVisual(node: TreeNode | null): number { // +1 function def
  if (!node) return 0; // +1 check, +1 return
  // +1 add, +1 Math.max (+ recursive call ops) for each node
  return 1 + Math.max(getSubtreeHeightForVisual(node.left), getSubtreeHeightForVisual(node.right));
}

let visualNodeIdCounter = 0; // Counter for generating unique IDs for visual nodes
/**
 * Recursively prepares a tree for SVG visualization by assigning coordinates and other visual properties.
 * @param node The current core TreeNode to process.
 * @param x The target x-coordinate for this node.
 * @param y The target y-coordinate for this node.
 * @param dx The horizontal displacement for children of this node.
 * @returns A VisualTreeNode representation or null if the input node is null.
 */
export function prepareTreeForVisual(
  node: TreeNode | null,
  x: number,
  y: number,
  dx: number
): VisualTreeNode | null {
  if (!node) return null; // Base case: if the node is null, return null

  visualNodeIdCounter++; // Increment for a unique ID
  
  // Create the visual node object
  const visualNode: VisualTreeNode = {
    // Core TreeNode properties
    data: node.data,
    height: node.height, // This is the AVL height property from TreeNode
    
    // VisualTreeNode specific properties
    id: `node-${visualNodeIdCounter}`,
    x: x,
    y: y,
    balanceFactor: getBalance(node), // Calculate balance factor for display
    subtreeHeight: getSubtreeHeightForVisual(node), // Calculate structural height for layout/display
    
    // Initialize children, to be populated by recursive calls
    left: null, 
    right: null,
  };

  // Recursively prepare left and right children
  if (node.left) {
    visualNode.left = prepareTreeForVisual(node.left, x - dx, y + Y_SPACING, dx * DX_MULTIPLIER);
  }
  if (node.right) {
    visualNode.right = prepareTreeForVisual(node.right, x + dx, y + Y_SPACING, dx * DX_MULTIPLIER);
  }
  
  return visualNode; // Return the fully prepared visual node
}


/**
 * Calculates dimensions (min/max X/Y, width, height) for the SVG tree.
 * This is used to set the viewBox of the SVG element so the entire tree is visible.
 */
export function getTreeDimensions(visualRoot: VisualTreeNode | null): { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number } {
  if (!visualRoot) return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };

  const nodes: VisualTreeNode[] = [];
  const collectNodes = (node: VisualTreeNode | null) => { // Inner helper function to gather all nodes
    if (node) {
      nodes.push(node);
      collectNodes(node.left); // Recursively collect from left subtree
      collectNodes(node.right); // Recursively collect from right subtree
    }
  };
  collectNodes(visualRoot); // Start collection from the root

  if (nodes.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  nodes.forEach(node => { // Iterate over all collected nodes to find boundaries
    minX = Math.min(minX, node.x - NODE_RADIUS);
    maxX = Math.max(maxX, node.x + NODE_RADIUS);
    minY = Math.min(minY, node.y - NODE_RADIUS);
    maxY = Math.max(maxY, node.y + NODE_RADIUS + 25); // Add extra space at bottom for text below nodes
  });

  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Generates a specified count of unique random integer values within a given range.
 */
export function generateRandomValues(count: number, min = 1, max = 200): number[] { // +1 function def
  if (count <= 0) return []; // +1 check, +1 return

  const rangeSize = max - min + 1; // +1 assign, +2 arithmetic
  if (count > rangeSize && rangeSize > 0) { // +1 check, +1 check, +1 logical AND
    throw new Error(`Cannot generate ${count} unique values from range [${min}-${max}]. Max possible is ${rangeSize}.`); // +1 throw
  }
  if (max < min && count > 0) { // +1 check, +1 check, +1 logical AND
    throw new Error("Max value for random generation cannot be less than min value when count > 0."); // +1 throw
  }

  const s = new Set<number>(); // +1 assign (Set init)
  while (s.size < count) { // Loop: 'count' successful additions. Loop check runs more due to potential collisions.
                           // Simplified: count * (1 check + 1 access s.size)
    s.add(Math.floor(Math.random() * rangeSize) + min); // +1 add (to set), +1 floor, +1 random, +1 multiply, +1 add = 5 ops
  }
  return Array.from(s); // +1 from, +1 return
}

/**
 * Calculates total frequency and constructs the BST for a given set of values.
 */
export function bstTotalInsertFrequency(values: number[]): { root: TreeNode | null; frequency: number } { // +1 function def
  let root: TreeNode | null = null; // +1 assign
  let totalFreq = 0; // +1 assign
  for (const key of values) { // Loop: values.length iterations. Loop check: values.length + 1.
    const isRootCurrentlyNull = !root; // +1 check, +1 assign
    const current_h_tree = isRootCurrentlyNull ? 0 : getTreeHeightForFrequency(root); // +1 check, +1 assign (+ ops from getTreeHeightForFrequency)
    totalFreq += bstInsertFrequencyOps(current_h_tree, isRootCurrentlyNull); // +1 add assign (+ ops from bstInsertFrequencyOps)
    root = insertBstIter(root, key); // insertBstIter ops counted within, +1 assign
  }
  return { root, frequency: totalFreq }; // +1 object creation, +1 return
}

/**
 * Calculates total frequency and constructs the AVL tree for a given set of values.
 */
export function avlTotalInsertFrequency(values: number[]): { root: TreeNode | null; frequency: number } { // +1 function def
  let root: TreeNode | null = null; // +1 assign
  let totalFreq = 0; // +1 assign
  for (const key of values) { // Loop: values.length iterations. Loop check: values.length + 1.
    const isRootCurrentlyNull = !root; // +1 check, +1 assign
    const current_h_tree = isRootCurrentlyNull ? 0 : getTreeHeightForFrequency(root); // +1 check, +1 assign (+ ops from getTreeHeightForFrequency)
    totalFreq += avlInsertFrequencyOps(current_h_tree, isRootCurrentlyNull); // +1 add assign (+ ops from avlInsertFrequencyOps)
    root = insertAvlIter(root, key); // insertAvlIter ops counted within, +1 assign
  }
  return { root, frequency: totalFreq }; // +1 object creation, +1 return
}
