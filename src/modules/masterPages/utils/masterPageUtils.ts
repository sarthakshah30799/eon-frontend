import type {
  IMasterPageDraftNode,
  IMasterPage,
  IMasterPageTreeNode,
} from '../types';

export const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `page_${Math.random().toString(36).slice(2, 11)}`;
};

export const createDraftNode = (
  parentId: string | null = null
): IMasterPageDraftNode => ({
  clientId: createId(),
  pageName: '',
  slug: '',
  parentId,
  makeChildren: false,
  children: [],
});

export const createMasterPageRecord = (
  values: Pick<IMasterPage, 'pageName' | 'slug' | 'parentId'>
): IMasterPage => ({
  id: createId(),
  pageName: values.pageName,
  slug: values.slug,
  parentId: values.parentId,
  createdAt: Date.now(),
});

export const buildMasterPageTree = (
  pages: IMasterPage[]
): IMasterPageTreeNode[] => {
  const nodeMap = new Map<string, IMasterPageTreeNode>();

  pages.forEach(page => {
    nodeMap.set(page.id, { ...page, children: [] });
  });

  const roots: IMasterPageTreeNode[] = [];

  pages.forEach(page => {
    const currentNode = nodeMap.get(page.id);

    if (!currentNode) {
      return;
    }

    if (page.parentId && nodeMap.has(page.parentId)) {
      nodeMap.get(page.parentId)?.children.push(currentNode);
      return;
    }

    roots.push(currentNode);
  });

  return roots;
};

export const flattenDraftTree = (
  nodes: IMasterPageDraftNode[],
  parentId: string | null = null,
  existingParentMap: Record<string, string> = {}
): IMasterPage[] => {
  const pages: IMasterPage[] = [];

  nodes.forEach(node => {
    const currentPage = createMasterPageRecord({
      pageName: node.pageName,
      slug: node.slug,
      parentId: node.parentId
        ? (existingParentMap[node.parentId] ?? node.parentId)
        : parentId,
    });

    const currentParentMap = {
      ...existingParentMap,
      [node.clientId]: currentPage.id,
    };

    pages.push(currentPage);
    pages.push(
      ...flattenDraftTree(node.children, currentPage.id, currentParentMap)
    );
  });

  return pages;
};

export const flattenPagesForOptions = (pages: IMasterPage[]) =>
  pages.map(page => ({
    value: page.id,
    label: page.pageName,
  }));

export const flattenDraftPagesForOptions = (nodes: IMasterPageDraftNode[]) => {
  const options: Array<{ value: string; label: string }> = [];

  const walk = (items: IMasterPageDraftNode[]) => {
    items.forEach(item => {
      if (item.pageName) {
        options.push({
          value: item.clientId,
          label: item.pageName,
        });
      }

      if (item.children.length) {
        walk(item.children);
      }
    });
  };

  walk(nodes);

  return options;
};
