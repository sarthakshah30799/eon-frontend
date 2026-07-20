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
  pageSize?: number;
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
      pageSize = 20,
      debounceDelay = 300,
      className = '',
      defaultOptions,
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
    const [hasMore, setHasMore] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const allOptionsRef = useRef<AsyncSelectOption[]>([]);
    const loadOptionsCallbackRef = useRef<
      ((options: AsyncSelectOption[]) => void) | null
    >(null);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
    const prevInputValueRef = useRef('');

    // Reset pagination when input changes significantly
    const resetPagination = useCallback(() => {
      setCurrentPage(1);
      allOptionsRef.current = [];
      setIsLoadingMore(false);
      setHasMore(true);
    }, []);

    const fetchOptionsPage = useCallback(
      async (
        searchValue: string,
        page: number,
        callback: (options: AsyncSelectOption[]) => void
      ) => {
        const response = await loadOptions(searchValue, page);
        const options = response.options ?? [];
        const nextHasMore = response.hasMore ?? options.length >= pageSize;

        if (pagination && page > 1) {
          const merged = [...allOptionsRef.current, ...options];
          allOptionsRef.current = merged;
          callback(merged);
        } else {
          allOptionsRef.current = options;
          callback(options);
        }

        setHasMore(!pagination ? false : nextHasMore);
      },
      [loadOptions, pagination, pageSize]
    );

    // Debounced load options function
    const debouncedLoadOptions = useCallback(
      (
        searchValue: string,
        callback: (options: AsyncSelectOption[]) => void
      ) => {
        loadOptionsCallbackRef.current = callback;

        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(async () => {
          try {
            if (searchValue.trim() !== prevInputValueRef.current.trim()) {
              resetPagination();
              prevInputValueRef.current = searchValue;
            }

            const page = pagination ? currentPage : 1;
            await fetchOptionsPage(searchValue, page, callback);
          } catch (error) {
            console.error('Error loading options:', error);
            callback([]);
            setHasMore(false);
          } finally {
            setIsLoadingMore(false);
          }
        }, debounceDelay);
      },
      [
        currentPage,
        debounceDelay,
        fetchOptionsPage,
        pagination,
        resetPagination,
      ]
    );

    // Handle menu scroll to bottom for pagination
    const handleMenuScrollToBottom = useCallback(() => {
      if (
        pagination &&
        !isLoadingMore &&
        hasMore &&
        loadOptionsCallbackRef.current
      ) {
        const nextPage = currentPage + 1;
        setIsLoadingMore(true);
        setCurrentPage(nextPage);
        void fetchOptionsPage(
          inputValue,
          nextPage,
          loadOptionsCallbackRef.current
        )
          .catch(error => {
            console.error('Error loading more options:', error);
            loadOptionsCallbackRef.current?.([]);
            setHasMore(false);
          })
          .finally(() => {
            setIsLoadingMore(false);
          });
      }
      props.onMenuScrollToBottom?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      currentPage,
      fetchOptionsPage,
      hasMore,
      inputValue,
      isLoadingMore,
      pagination,
      props.onMenuScrollToBottom,
    ]);

    // Handle input change
    const handleInputChange = useCallback(
      (newValue: string, { action, prevInputValue }: InputActionMeta) => {
        const nextValue = newValue.toUpperCase();
        setInputValue(nextValue);
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

    const customStyles: StylesConfig<AsyncSelectOption, boolean> = {
      control: (base, state) => ({
        ...base,
        borderColor: error ? 'var(--color-error-500)' : '#94a3b8',
        '&:hover': {
          borderColor: error
            ? 'var(--color-error-500)'
            : state.isFocused
              ? '#64748b'
              : '#94a3b8',
        },
        boxShadow: error
          ? '0 0 0 1px var(--color-error-500)'
          : state.isFocused
            ? '0 0 0 1px #64748b'
            : 'none',
        minHeight: '1.875rem',
        cursor: state.isDisabled ? 'not-allowed' : 'default',
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
              classNamePrefix="react-select"
              isSearchable={isSearchable}
              inputValue={inputValue}
              cacheOptions={!pagination}
              defaultOptions={defaultOptions ?? true}
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
              classNamePrefix="react-select"
              isSearchable={isSearchable}
              inputValue={inputValue}
              cacheOptions={!pagination}
              defaultOptions={defaultOptions ?? true}
              loadOptions={debouncedLoadOptions}
              onMenuScrollToBottom={handleMenuScrollToBottom}
              onInputChange={handleInputChange}
              isLoading={isLoadingMore}
              styles={customStyles}
              noOptionsMessage={({ inputValue }) =>
                inputValue ? 'No options found' : 'Start typing to search...'
              }
              isDisabled={props.disabled}
              menuPosition="absolute"
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
