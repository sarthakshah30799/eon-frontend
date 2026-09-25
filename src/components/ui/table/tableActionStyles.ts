/** Sticky Actions column — keeps header above row icons while scrolling. */
export const TABLE_ACTIONS_COLUMN_META = {
  headerClassName:
    'sticky top-0 right-0 z-40 border-l border-border-primary bg-surface-secondary',
  cellClassName:
    'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
} as const;

/** Compact action hit area so rows stay ~36px with default cell `py-2`. */
export const TABLE_ACTIONS_CELL_CLASSNAME = 'flex h-5 items-center gap-1';

export const TABLE_ACTION_BUTTON_CLASSNAME =
  'size-5 rounded-sm bg-transparent p-0! text-black! hover:bg-surface-secondary hover:text-text-primary';

export const TABLE_ACTION_DELETE_BUTTON_CLASSNAME =
  'size-5 rounded-sm bg-transparent p-0! text-error-600 hover:bg-error-50 hover:text-error-700';

export const TABLE_ACTION_ICON_CLASSNAME = 'h-4 w-4';

const STICKY_ACTION_CLASS_RE =
  /(?:^|\s)(?:sticky|top-\S+|right-\S+|z-\S+|border-l|border-border-primary|bg-surface-(?:secondary|primary))(?=\s|$)/g;

/** Merge shared sticky Actions styles with any extra meta classes (e.g. width). */
export function resolveTableColumnMeta(
  columnId: string | undefined,
  meta?: { headerClassName?: string; cellClassName?: string }
): { headerClassName?: string; cellClassName?: string } {
  if (columnId !== 'actions') {
    return meta ?? {};
  }

  const extraHeader = (meta?.headerClassName ?? '')
    .replace(STICKY_ACTION_CLASS_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const extraCell = (meta?.cellClassName ?? '')
    .replace(STICKY_ACTION_CLASS_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    headerClassName: [TABLE_ACTIONS_COLUMN_META.headerClassName, extraHeader]
      .filter(Boolean)
      .join(' '),
    cellClassName: [TABLE_ACTIONS_COLUMN_META.cellClassName, extraCell]
      .filter(Boolean)
      .join(' '),
  };
}
