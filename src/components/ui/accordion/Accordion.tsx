import {
  createContext,
  type HTMLAttributes,
  type MouseEvent,
  type FC,
  type ReactNode,
  useContext,
  useId,
  useCallback,
  useMemo,
  useState,
} from 'react';

type AccordionType = 'single' | 'multiple';

interface AccordionContextValue {
  type: AccordionType;
  openValues: string[];
  toggleItem: (value: string) => void;
}

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  children: ReactNode;
}

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(
  undefined
);

const AccordionItemContext = createContext<{
  value: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
} | null>(null);

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const normalizeValues = (
  type: AccordionType,
  value?: string | string[],
  defaultValue?: string | string[]
) => {
  const source = value ?? defaultValue;

  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    return type === 'multiple' ? source : source.slice(0, 1);
  }

  return [source];
};

const AccordionBase = ({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  className,
  children,
  ...props
}: AccordionProps) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(() =>
    normalizeValues(type, undefined, defaultValue)
  );

  const openValues = isControlled
    ? normalizeValues(type, value)
    : internalValue;

  const commitValue = useCallback(
    (nextValues: string[]) => {
      if (!isControlled) {
        setInternalValue(nextValues);
      }

      if (!nextValues.length) {
        onValueChange?.(type === 'multiple' ? [] : '');
        return;
      }

      onValueChange?.(type === 'multiple' ? nextValues : (nextValues[0] ?? ''));
    },
    [isControlled, onValueChange, type]
  );

  const contextValue = useMemo<AccordionContextValue>(
    () => ({
      type,
      openValues,
      toggleItem: (itemValue: string) => {
        if (type === 'multiple') {
          const nextValues = openValues.includes(itemValue)
            ? openValues.filter(valueItem => valueItem !== itemValue)
            : [...openValues, itemValue];

          commitValue(nextValues);
          return;
        }

        const isOpen = openValues[0] === itemValue;
        if (isOpen && collapsible) {
          commitValue([]);
          return;
        }

        commitValue([itemValue]);
      },
    }),
    [collapsible, commitValue, openValues, type]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        className={cn(
          'overflow-hidden rounded-2xl border border-border-primary bg-surface-primary shadow-sm',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({
  value,
  disabled = false,
  className,
  children,
  ...props
}: AccordionItemProps) => {
  const context = useContext(AccordionContext);
  const id = useId();

  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion');
  }

  const open = context.openValues.includes(value);
  const triggerId = `accordion-trigger-${id}`;
  const contentId = `accordion-content-${id}`;

  return (
    <AccordionItemContext.Provider
      value={{ value, open, disabled, triggerId, contentId }}
    >
      <div
        className={cn(
          'border-b border-border-primary last:border-b-0',
          open && 'bg-surface-secondary/60',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
};

const AccordionTrigger = ({
  children,
  className,
  onClick,
  ...props
}: AccordionTriggerProps) => {
  const context = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!context || !itemContext) {
    throw new Error('AccordionTrigger must be used within an AccordionItem');
  }

  return (
    <button
      id={itemContext.triggerId}
      type="button"
      aria-expanded={itemContext.open}
      aria-controls={itemContext.contentId}
      disabled={itemContext.disabled}
      className={cn(
        'flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-text-primary transition hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5',
        className
      )}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (!itemContext.disabled) {
          context.toggleItem(itemContext.value);
        }
      }}
      {...props}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <svg
        aria-hidden="true"
        className={cn(
          'h-5 w-5 shrink-0 text-text-tertiary transition-transform duration-200',
          itemContext.open && 'rotate-180'
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

const AccordionContent = ({
  children,
  className,
  ...props
}: AccordionContentProps) => {
  const itemContext = useContext(AccordionItemContext);

  if (!itemContext) {
    throw new Error('AccordionContent must be used within an AccordionItem');
  }

  return (
    <div
      id={itemContext.contentId}
      role="region"
      aria-labelledby={itemContext.triggerId}
      className={cn(
        'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
        itemContext.open
          ? 'grid-rows-[1fr] opacity-100'
          : 'grid-rows-[0fr] opacity-0'
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            'px-4 pb-4 text-sm leading-6 text-text-secondary sm:px-5',
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

type AccordionComponent = FC<AccordionProps> & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
};

const Accordion = AccordionBase as AccordionComponent;

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

export { Accordion };
export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
};

export default Accordion;
