import type { PrimitiveNode } from '../types';

// =====================================================================
// BLUEPRINT TREE OPERATIONS
// =====================================================================
// AI's mutate_widget actions reference nodes by a numeric PATH — a list
// of child indices from the root. e.g. path [0, 2] means
// root.children[0].children[2].
//
// All operations are PURE — they return a new tree without mutating the
// input. This keeps Zustand/React happy.
// =====================================================================

/** Clone a node one level deep enough to safely mutate children array. */
function shallowCloneWithChildren(n: PrimitiveNode): PrimitiveNode {
  return { ...n, children: n.children ? [...n.children] : undefined };
}

/** Walk to a node along the path, returning null if invalid. */
export function getNodeAt(root: PrimitiveNode, path: number[]): PrimitiveNode | null {
  let cur: PrimitiveNode | undefined = root;
  for (const idx of path) {
    if (!cur?.children || idx < 0 || idx >= cur.children.length) return null;
    cur = cur.children[idx];
  }
  return cur ?? null;
}

/** Apply a transform to the node at `path`, returning a new root. */
function transformAtPath(
  root: PrimitiveNode,
  path: number[],
  fn: (target: PrimitiveNode) => PrimitiveNode | null,
): PrimitiveNode | null {
  if (path.length === 0) {
    return fn(root);
  }
  const [head, ...rest] = path;
  if (!root.children || head < 0 || head >= root.children.length) return null;

  const newChildren = [...root.children];
  const updatedChild = transformAtPath(root.children[head], rest, fn);
  if (updatedChild === null) {
    // Child was removed; drop it from the parent's children array
    newChildren.splice(head, 1);
    return { ...root, children: newChildren };
  }
  newChildren[head] = updatedChild;
  return { ...root, children: newChildren };
}

export function replaceNode(
  root: PrimitiveNode,
  path: number[],
  replacement: PrimitiveNode,
): PrimitiveNode {
  const result = transformAtPath(root, path, () => replacement);
  return result ?? root;
}

export function updateProps(
  root: PrimitiveNode,
  path: number[],
  propsPatch: Record<string, unknown>,
): PrimitiveNode {
  const result = transformAtPath(root, path, (target) => ({
    ...target,
    props: { ...(target.props ?? {}), ...propsPatch },
  }));
  return result ?? root;
}

export function removeNode(root: PrimitiveNode, path: number[]): PrimitiveNode {
  if (path.length === 0) {
    // Cannot remove root — return as-is
    console.warn('[treeOps] cannot remove root node');
    return root;
  }
  const result = transformAtPath(root, path, () => null);
  return result ?? root;
}

export function appendChild(
  root: PrimitiveNode,
  parentPath: number[],
  newChild: PrimitiveNode,
): PrimitiveNode {
  const result = transformAtPath(root, parentPath, (parent) => {
    const clone = shallowCloneWithChildren(parent);
    clone.children = [...(clone.children ?? []), newChild];
    return clone;
  });
  return result ?? root;
}

/** Walk the whole tree and collect a compact summary for Dev Tools. */
export function summarizeTree(node: PrimitiveNode, depth = 0): string {
  const indent = '  '.repeat(depth);
  const propsStr = node.props && Object.keys(node.props).length
    ? ` ${Object.keys(node.props).join(',')}`
    : '';
  const head = `${indent}${node.primitive}${propsStr}`;
  if (!node.children?.length) return head;
  return [head, ...node.children.map((c) => summarizeTree(c, depth + 1))].join('\n');
}
