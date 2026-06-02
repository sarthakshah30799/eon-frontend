import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  IMasterPageDraftNode,
  IMasterPage,
  IMasterPageTreeNode,
} from '../modules/masterPages/types';
import {
  buildMasterPageTree,
  flattenDraftTree,
} from '../modules/masterPages/utils';

const STORAGE_KEY = 'maraekat_master_pages';

interface MasterPagesContextType {
  pages: IMasterPage[];
  tree: IMasterPageTreeNode[];
  createPages: (draftPages: IMasterPageDraftNode[]) => void;
  findPageBySlug: (slug: string) => IMasterPage | undefined;
}

const MasterPagesContext = createContext<MasterPagesContextType | undefined>(
  undefined
);

interface MasterPagesProviderProps {
  children: ReactNode;
}

const readStoredPages = (): IMasterPage[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as IMasterPage[]) : [];
  } catch {
    return [];
  }
};

export const MasterPagesProvider = ({ children }: MasterPagesProviderProps) => {
  const [pages, setPages] = useState<IMasterPage[]>(() =>
    readStoredPages()
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  }, [pages]);

  const createPages = (draftPages: IMasterPageDraftNode[]) => {
    const newPages = flattenDraftTree(draftPages);
    setPages(currentPages => [...currentPages, ...newPages]);
  };

  const value = useMemo<MasterPagesContextType>(
    () => ({
      pages,
      tree: buildMasterPageTree(pages),
      createPages,
      findPageBySlug: (slug: string) => pages.find(page => page.slug === slug),
    }),
    [pages]
  );

  return (
    <MasterPagesContext.Provider value={value}>
      {children}
    </MasterPagesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMasterPages = () => {
  const context = useContext(MasterPagesContext);

  if (!context) {
    throw new Error('useMasterPages must be used within a MasterPagesProvider');
  }

  return context;
};
