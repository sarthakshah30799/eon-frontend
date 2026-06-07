import React, { useState, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import AsyncSelectBase from 'react-select/async';
import AsyncCreatableSelect, {
  type AsyncCreatableProps,
} from 'react-select/async-creatable';
import type {
  GroupBase,
  InputActionMeta,
  SelectInstance,
  StylesConfig,
} from 'react-select';
import { Label } from '../label';
import './AsyncSelect.css';

const asyncSelectVariants = cva('react-select-container', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-sm',
    },
    variant: {
      default: '',
      error: 'react-select-error',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface AsyncSelectOption {
  value: string | number;
  label: string;
  isDisabled?: boolean;
}

export interface AsyncSelectPaginationMeta {
  page?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface AsyncSelectResponse {
  options: AsyncSelectOption[];
  meta?: AsyncSelectPaginationMeta;
  hasMore?: boolean;
}

export interface AsyncSelectProps<IsMulti extends boolean = false>
  extends
    Omit<
      AsyncCreatableProps<
        AsyncSelectOption,
        IsMulti,
        GroupBase<AsyncSelectOption>
      >,
      'loadOptions'
    >,
    VariantProps<typeof asyncSelectVariants> {
  label?: string;
  error?: string;
  loadOptions: (
    inputValue: string,
    page?: number
  ) => Promise<AsyncSelectResponse>;
  onMenuScrollToBottom?: () => void;
  pagination?: boolean;
  debounceDelay?: number;
  className?: string;
  disabled?: boolean;
  isCreatable?: boolean;
  isSearchable?: boolean;
}

const AsyncSelectComponent = React.forwardRef<
  SelectInstance<AsyncSelectOption, boolean, GroupBase<AsyncSelectOption>>,
  AsyncSelectProps<boolean>
>(
  (
    {
      label,
      error,
      loadOptions,
      pagination = false,
      debounceDelay = 300,
      className = '',
      size,
      variant,
      isCreatable = false,
      isSearchable = true,
      onInputChange: externalOnInputChange,
      ...props
    },
    ref
  ) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [allOptions, setAllOptions] = useState<AsyncSelectOption[]>([]);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
    const prevInputValueRef = useRef('');

    // Reset pagination when input changes significantly
    const resetPagination = useCallback(() => {
      setCurrentPage(1);
      setAllOptions([]);
      setIsLoadingMore(false);
    }, []);

    // Debounced load options function
    const debouncedLoadOptions = useCallback(
      (
        inputValue: string,
        callback: (options: AsyncSelectOption[]) => void
      ) => {
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout
        debounceTimeoutRef.current = setTimeout(async () => {
          try {
            // Reset if input changed significantly (not just scrolling)
            if (inputValue.trim() !== prevInputValueRef.current.trim()) {
              resetPagination();
              prevInputValueRef.current = inputValue;
            }

            const page = pagination ? currentPage : 1;
            const response = await loadOptions(inputValue, page);
            const options = response.options ?? [];

            if (pagination && currentPage > 1) {
              // Append to existing options for pagination
              setAllOptions(prev => [...prev, ...options]);
              callback([...allOptions, ...options]);
            } else {
              // Replace options for new search
              setAllOptions(options);
              callback(options);
            }

            setIsLoadingMore(false);
          } catch (error) {
            console.error('Error loading options:', error);
            callback([]);
            setIsLoadingMore(false);
          }
        }, debounceDelay);
      },
      [
        loadOptions,
        pagination,
        currentPage,
        allOptions,
        resetPagination,
        debounceDelay,
      ]
    );

    // Handle menu scroll to bottom for pagination
    const handleMenuScrollToBottom = useCallback(() => {
      if (pagination && !isLoadingMore) {
        setIsLoadingMore(true);
        setCurrentPage(prev => prev + 1);
      }
      props.onMenuScrollToBottom?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination, isLoadingMore, props.onMenuScrollToBottom]);

    // Handle input change
    const handleInputChange = useCallback(
      (newValue: string, { action, prevInputValue }: InputActionMeta) => {
        const nextValue = newValue.toUpperCase();

        // Reset pagination when user starts typing new search
        if (
          action === 'input-change' &&
          nextValue.trim() !== prevInputValueRef.current.trim()
        ) {
          resetPagination();
          prevInputValueRef.current = nextValue;
        }

        externalOnInputChange?.(nextValue, { action, prevInputValue });
        return nextValue;
      },
      [externalOnInputChange, resetPagination]
    );

    // Custom styles

    const customStyles: StylesConfig<
      AsyncSelectOption,
      boolean
    > = {
      control: (base, state) => ({
        ...base,
        borderColor: error
          ? 'var(--color-error-500)'
          : '#94a3b8',
        '&:hover': {
          borderColor: error
            ? 'var(--color-error-500)'
            : state.isFocused
              ? '#64748b'
              : '#94a3b8',
        },
        borderRadius: '6px',
        boxShadow: error
          ? '0 0 0 1px var(--color-error-500)'
          : state.isFocused
            ? '0 0 0 1px #64748b'
            : 'none',
        minHeight: '34px',
        height: '34px',
        backgroundColor: 'var(--color-surface-primary)',
      }),
      loadingIndicator: base => ({
        ...base,
        color: 'var(--color-text-tertiary)',
      }),
      menu: base => ({
        ...base,
        zIndex: 50,
      }),
    };

    return (
      <div className="space-y-1">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <div className={asyncSelectVariants({ size, variant, className })}>
          {isCreatable ? (
            <AsyncCreatableSelect
              ref={ref}
              isSearchable={isSearchable}
              cacheOptions={!pagination}
              defaultOptions
              loadOptions={debouncedLoadOptions}
              onMenuScrollToBottom={handleMenuScrollToBottom}
              onInputChange={handleInputChange}
              isLoading={isLoadingMore}
              styles={customStyles}
              noOptionsMessage={({ inputValue }) =>
                inputValue ? 'No options found' : 'Start typing to search...'
              }
              isDisabled={props.disabled}
              {...props}
            />
          ) : (
            <AsyncSelectBase
              ref={ref}
              isSearchable={isSearchable}
              cacheOptions={!pagination}
              defaultOptions
              loadOptions={debouncedLoadOptions}
              onMenuScrollToBottom={handleMenuScrollToBottom}
              onInputChange={handleInputChange}
              isLoading={isLoadingMore}
              styles={customStyles}
              noOptionsMessage={({ inputValue }) =>
                inputValue ? 'No options found' : 'Start typing to search...'
              }
              isDisabled={props.disabled}
              {...props}
            />
          )}
        </div>
        {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);

AsyncSelectComponent.displayName = 'AsyncSelect';

// eslint-disable-next-line react-refresh/only-export-components
export { AsyncSelectComponent as AsyncSelect, asyncSelectVariants };
export default AsyncSelectComponent;
