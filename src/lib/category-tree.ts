import { Category } from "@/types/category";

export interface CategoryNode extends Category {
  children: CategoryNode[];
  depth: number;
  path: string[]; // ancestor names + own name
}

export interface FlatCategoryNode {
  category: Category;
  depth: number;
  path: string[]; // ancestor names (excluding self)
  hasChildren: boolean;
}

/**
 * Builds a hierarchical tree of categories from a flat list.
 * Orphans (parentId pointing to missing node) are treated as roots.
 */
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const byId = new Map<number, CategoryNode>();
  categories.forEach((c) =>
    byId.set(c.id, { ...c, children: [], depth: 0, path: [c.name] })
  );

  const roots: CategoryNode[] = [];
  byId.forEach((node) => {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const fix = (node: CategoryNode, depth: number, ancestors: string[]) => {
    node.depth = depth;
    node.path = [...ancestors, node.name];
    node.children.sort((a, b) => a.name.localeCompare(b.name, "fa"));
    node.children.forEach((c) => fix(c, depth + 1, node.path));
  };
  roots.sort((a, b) => a.name.localeCompare(b.name, "fa"));
  roots.forEach((r) => fix(r, 0, []));

  return roots;
}

/**
 * Flattens a category tree into an ordered list with depth info,
 * preserving parent → child → grandchild order. Useful for selects.
 */
export function flattenCategoryTree(
  categories: Category[]
): FlatCategoryNode[] {
  const tree = buildCategoryTree(categories);
  const out: FlatCategoryNode[] = [];
  const walk = (node: CategoryNode, ancestors: string[]) => {
    out.push({
      category: {
        id: node.id,
        name: node.name,
        description: node.description,
        createdAt: node.createdAt,
        parentId: node.parentId,
        parentName: node.parentName,
        image: node.image,
        productCount: node.productCount,
      },
      depth: node.depth,
      path: ancestors,
      hasChildren: node.children.length > 0,
    });
    node.children.forEach((c) => walk(c, [...ancestors, node.name]));
  };
  tree.forEach((r) => walk(r, []));
  return out;
}

/** Returns "Parent › Child" style breadcrumb for a category. */
export function getCategoryBreadcrumb(
  category: Category,
  categories: Category[],
  separator = " › "
): string {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const parts: string[] = [];
  let current: Category | undefined = category;
  const guard = new Set<number>();
  while (current && !guard.has(current.id)) {
    guard.add(current.id);
    parts.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return parts.join(separator);
}
