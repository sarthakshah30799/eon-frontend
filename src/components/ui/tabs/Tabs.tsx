import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createSafeId } from './tabsUtils';

type TabsOrientation = 'horizontal' | 'vertical';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: TabsOrientation;
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  children: ReactNode;
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface TabsTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  children: ReactNode;
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
  children: ReactNode;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const Tabs = ({
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  className,
  children,
  ...props
}: TabsProps) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = isControlled ? value : internalValue;

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value: currentValue ?? '',
      setValue: nextValue => {
        if (!isControlled) {
          setInternalValue(nextValue);
        }

        onValueChange?.(nextValue);
      },
      orientation,
    }),
    [currentValue, isControlled, onValueChange, orientation]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({
  className,
  children,
  ...props
}: TabsListProps) => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabsList must be used within Tabs');
  }

  return (
    <div
      role="tablist"
      aria-orientation={context.orientation}
      className={cn(
        'inline-flex w-full items-center gap-2 rounded-sm p-1',
        context.orientation === 'vertical' && 'flex-col items-stretch',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({
  value,
  className,
  children,
  onClick,
  disabled = false,
  ...props
}: TabsTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  const active = context.value === value;
  const safeId = createSafeId(value);
  const tabId = `tabs-trigger-${safeId}`;
  const panelId = `tabs-content-${safeId}`;

  return (
    <button
      id={tabId}
      type="button"
      role="tab"
      data-state={active ? 'active' : 'inactive'}
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'text-text-primary border-b-2 border-primary-500'
          : 'text-text-secondary hover:bg-surface-primary hover:text-text-primary',
        context.orientation === 'vertical' && 'w-full justify-start',
        className
      )}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (!event.defaultPrevented && !disabled) {
          context.setValue(value);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  value,
  forceMount = false,
  className,
  children,
  ...props
}: TabsContentProps) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  const active = context.value === value;
  const safeId = createSafeId(value);
  const contentId = `tabs-content-${safeId}`;
  const triggerId = `tabs-trigger-${safeId}`;

  if (!forceMount && !active) {
    return null;
  }

  return (
    <div
      id={contentId}
      role="tabpanel"
      data-state={active ? 'active' : 'inactive'}
      aria-labelledby={triggerId}
      hidden={!active}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </div>
  );
};
