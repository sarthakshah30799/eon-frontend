import {
  createContext,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  useContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type DropdownAlignment = 'start' | 'end';
type DropdownPlacement = 'bottom' | 'right';

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  align: DropdownAlignment;
  setAnchorRect: (rect: DOMRect | null) => void;
  anchorRect: DOMRect | null;
}

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: DropdownAlignment;
  children: ReactNode;
}

interface DropdownTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  placement?: DropdownPlacement;
  portal?: boolean;
  offset?: number;
}

interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  inset?: boolean;
}

interface DropdownLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  inset?: boolean;
}

type DropdownSeparatorProps = HTMLAttributes<HTMLHRElement>;

const DropdownContext = createContext<DropdownContextValue | undefined>(
  undefined
);

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const DropdownBase = ({
  open,
  defaultOpen = false,
  onOpenChange,
  align = 'start',
  className,
  children,
  ...props
}: DropdownProps) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const currentOpen = isControlled ? Boolean(open) : internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const contextValue: DropdownContextValue = {
    open: currentOpen,
    setOpen,
    toggle: () => setOpen(!currentOpen),
    close: () => setOpen(false),
    align,
    setAnchorRect,
    anchorRect,
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;

      if (target?.closest('[data-dropdown-layer="true"]')) {
        return;
      }

      if (
        currentOpen &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentOpen, setOpen]);

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn('relative block text-left', className)}
        {...props}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownTrigger = ({
  children,
  className,
  onClick,
  type = 'button',
  ...props
}: DropdownTriggerProps) => {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error('DropdownTrigger must be used within a Dropdown');
  }

  return (
    <button
      type={type}
      aria-haspopup="menu"
      aria-expanded={context.open}
      className={cn(
        'inline-flex items-center justify-between gap-2 rounded-xl border border-border-secondary bg-surface-primary px-4 py-2 text-sm font-medium text-text-secondary shadow-sm transition hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={event => {
        context.setAnchorRect(event.currentTarget.getBoundingClientRect());
        onClick?.(event);
        if (!event.defaultPrevented) {
          context.toggle();
        }
      }}
      {...props}
    >
      <span className="min-w-0">{children}</span>
      <svg
        aria-hidden="true"
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          context.open && 'rotate-180'
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};

const DropdownMenu = ({
  children,
  className,
  placement = 'bottom',
  portal = false,
  offset = 8,
  ...props
}: DropdownMenuProps) => {
  const context = useContext(DropdownContext);
  const menuRef = useRef<HTMLDivElement>(null);
  const [positionStyle, setPositionStyle] = useState<CSSProperties | undefined>(
    undefined
  );
  const isOpen = context?.open ?? false;

  useLayoutEffect(() => {
    if (!portal || !isOpen || !context?.anchorRect || !menuRef.current) {
      return;
    }

    const triggerRect = context.anchorRect;
    const menuRect = menuRef.current.getBoundingClientRect();

    if (placement === 'right') {
      const availableRight = window.innerWidth - triggerRect.right;
      const fitsRight = availableRight >= menuRect.width + offset;

      setPositionStyle({
        position: 'fixed',
        top: triggerRect.top,
        left: fitsRight
          ? triggerRect.right + offset
          : Math.max(8, triggerRect.left - menuRect.width - offset),
      });
      return;
    }

    setPositionStyle({
      position: 'fixed',
      top: triggerRect.bottom + offset,
      left: triggerRect.left,
    });
  }, [portal, isOpen, context?.anchorRect, offset, placement]);

  if (!context) {
    throw new Error('DropdownMenu must be used within a Dropdown');
  }

  if (!isOpen) {
    return null;
  }

  const menuNode = (
    <div
      ref={menuRef}
      data-dropdown-layer="true"
      role="menu"
      aria-orientation="vertical"
      className={cn(
        portal ? 'fixed z-50' : 'absolute z-50 mt-2',
        'min-w-56 overflow-hidden rounded-2xl border border-border-primary bg-surface-primary p-1 shadow-xl ring-1 ring-primary-500/5',
        placement === 'right'
          ? 'origin-top-left'
          : context.align === 'end'
            ? 'origin-top-right'
            : 'origin-top-left',
        placement === 'right' && 'w-max',
        className
      )}
      style={portal ? positionStyle : undefined}
      {...props}
    >
      {children}
    </div>
  );

  if (portal && typeof document !== 'undefined') {
    return createPortal(menuNode, document.body);
  }

  return (
    <div
      data-dropdown-layer="true"
      role="menu"
      aria-orientation="vertical"
      className={cn(
        'absolute z-50 mt-2 min-w-56 overflow-hidden rounded-2xl border border-border-primary bg-surface-primary p-1 shadow-xl ring-1 ring-primary-500/5',
        context.align === 'end'
          ? 'right-0 origin-top-right'
          : 'left-0 origin-top-left',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownItem = ({
  children,
  className,
  inset = false,
  onClick,
  ...props
}: DropdownItemProps) => {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error('DropdownItem must be used within a Dropdown');
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary focus:outline-none focus-visible:bg-surface-secondary focus-visible:text-text-primary',
        inset && 'pl-8',
        className
      )}
      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          context.close();
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

const DropdownLabel = ({
  children,
  className,
  inset = false,
  ...props
}: DropdownLabelProps) => {
  return (
    <div
      className={cn(
        'px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownSeparator = ({ className, ...props }: DropdownSeparatorProps) => {
  return (
    <hr className={cn('my-1 border-border-primary', className)} {...props} />
  );
};

const Dropdown = Object.assign(DropdownBase, {
  Trigger: DropdownTrigger,
  Menu: DropdownMenu,
  Item: DropdownItem,
  Label: DropdownLabel,
  Separator: DropdownSeparator,
});

export type {
  DropdownAlignment,
  DropdownItemProps,
  DropdownLabelProps,
  DropdownMenuProps,
  DropdownProps,
  DropdownSeparatorProps,
  DropdownTriggerProps,
};

export { Dropdown };
export default Dropdown;
