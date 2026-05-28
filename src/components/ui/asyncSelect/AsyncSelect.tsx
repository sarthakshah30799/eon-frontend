import React, { useState, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import AsyncSelect, { type AsyncProps } from 'react-select/async';
import { Label } from '../label';
import './AsyncSelect.css';

const asyncSelectVariants = cva('react-select-container', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
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

// Extended interfaces based on react-select types
export interface AsyncSelectOption {
  value: string | number;
  label: string;
  isDisabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface AsyncSelectGroupOption {
  label: string;
  options: AsyncSelectOption[];
}

export interface AsyncSelectLoadOptions {
  inputValue: string;
  callback: (options: AsyncSelectOption[] | AsyncSelectGroupOption[]) => void;
}

export interface AsyncSelectPaginationMeta {
  page?: number;
  totalCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface AsyncSelectResponse {
  options: AsyncSelectOption[] | AsyncSelectGroupOption[];
  meta?: AsyncSelectPaginationMeta;
  hasMore?: boolean;
}

export interface AsyncSelectProps
  extends
    Omit<
      AsyncProps<AsyncSelectOption, false, AsyncSelectGroupOption>,
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AsyncSelectComponent = React.forwardRef<any, AsyncSelectProps>(
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

            let options: AsyncSelectOption[] = [];

            if (Array.isArray(response)) {
              // Handle direct array response
              options = response;
            } else if (response.options) {
              // Handle paginated response with grouped or flat options
              const normalizedOptions = response.options as Array<
                AsyncSelectOption | AsyncSelectGroupOption
              >;

              options = normalizedOptions.flatMap(option =>
                'options' in option ? option.options : [option]
              );
            }

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
      (newValue: string, { action }: { action: string }) => {
        // Reset pagination when user starts typing new search
        if (
          action === 'input-change' &&
          newValue.trim() !== prevInputValueRef.current.trim()
        ) {
          resetPagination();
          prevInputValueRef.current = newValue;
        }
      },
      [resetPagination]
    );

    // Custom styles

    const customStyles = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      control: (base: any, state: any) => ({
        ...base,
        borderColor: error ? 'var(--color-error-500)' : base.borderColor,
        '&:hover': {
          borderColor: error
            ? 'var(--color-error-500)'
            : state.isFocused
              ? 'var(--color-primary-500)'
              : base.borderColor,
        },
        borderRadius: '4px', // Rounded-md
        boxShadow: error
          ? '0 0 0 1px var(--color-error-500)'
          : state.isFocused
            ? '0 0 0 1px var(--color-primary-500)'
            : base.boxShadow,
        minHeight: size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px',
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      loadingIndicator: (base: any) => ({
        ...base,
        color: 'var(--color-primary-500)',
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      menu: (base: any) => ({
        ...base,
        zIndex: 50,
      }),
    };

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <div className={asyncSelectVariants({ size, variant, className })}>
          <AsyncSelect
            ref={ref}
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
