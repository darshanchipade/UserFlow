export type TreeNode = {
  id: string;
  label: string;
  path: string;
  dataPath: string[];
  type: "object" | "array" | "value";
  children?: TreeNode[];
};

const MAX_TREE_NODES = 800;
const MAX_ARRAY_CHILDREN = 12;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const buildTreeFromJson = (
  payload: unknown,
  idPrefix: string[] = [],
  displayPrefix: string[] = [],
  dataPrefix: string[] = [],
  counter: { value: number } = { value: 0 },
): TreeNode[] => {
  const safeIdPrefix = Array.isArray(idPrefix) ? idPrefix : [];
  const safeDisplayPrefix = Array.isArray(displayPrefix) ? displayPrefix : [];
  const safeDataPrefix = Array.isArray(dataPrefix) ? dataPrefix : [];
  if (counter.value >= MAX_TREE_NODES) return [];

  if (Array.isArray(payload)) {
    return payload.slice(0, MAX_ARRAY_CHILDREN).flatMap((entry, index) => {
      const label = `[${index}]`;
      const idPath = [...safeIdPrefix, label];
      const displayPath = [...safeDisplayPrefix, label];
      const dataPath = [...safeDataPrefix, label];
      counter.value += 1;
      if (counter.value >= MAX_TREE_NODES) return [];

      const childNodes = buildTreeFromJson(
        entry,
        idPath,
        displayPath,
        dataPath,
        counter,
      );
      return [
        {
          id: idPath.join("."),
          label,
          path: displayPath.join("."),
          dataPath,
          type: Array.isArray(entry)
            ? "array"
            : isPlainObject(entry)
              ? "object"
              : "value",
          children: childNodes.length ? childNodes : undefined,
        },
      ];
    });
  }

  if (isPlainObject(payload)) {
    return Object.entries(payload).flatMap(([key, value]) => {
      if (counter.value >= MAX_TREE_NODES) return [];
      const idPath = [...safeIdPrefix, key];
      const displayPath = [...safeDisplayPrefix, key];
      const dataPath = [...safeDataPrefix, key];
      counter.value += 1;
      const childNodes = buildTreeFromJson(
        value,
        idPath,
        displayPath,
        dataPath,
        counter,
      );
      return [
        {
          id: idPath.join("."),
          label: key,
          path: displayPath.join("."),
          dataPath,
          type: Array.isArray(value)
            ? "array"
            : isPlainObject(value)
              ? "object"
              : "value",
          children: childNodes.length ? childNodes : undefined,
        },
      ];
    });
  }

  return [];
};

export const gatherLeafNodes = (node: TreeNode): TreeNode[] => {
  if (!node.children || node.children.length === 0) {
    return [node];
  }
  return node.children.flatMap((child) => gatherLeafNodes(child));
};

export const gatherNodeIds = (node: TreeNode): string[] => {
  return [
    node.id,
    ...(node.children?.flatMap((child) => gatherNodeIds(child)) ?? []),
  ];
};

export const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
  if (!query) return nodes;
  const normalized = query.toLowerCase();

  const searchNode = (node: TreeNode): TreeNode | null => {
    const matches = node.label.toLowerCase().includes(normalized);
    if (!node.children || node.children.length === 0) {
      return matches ? node : null;
    }
    const filteredChildren = node.children
      .map(searchNode)
      .filter((child): child is TreeNode => Boolean(child));
    if (matches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren.length ? filteredChildren : undefined,
      };
    }
    return null;
  };

  return nodes
    .map(searchNode)
    .filter((node): node is TreeNode => Boolean(node));
};