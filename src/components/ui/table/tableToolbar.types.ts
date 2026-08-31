import type { ReactNode } from 'react';
import type {
  AsyncSelectOption,
  AsyncSelectProps,
} from '../asyncSelect/AsyncSelect';

export type TableToolbarSearchFilter = {
  id: string;
  type: 'search';
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  hidden?: boolean;
};

export type TableToolbarAsyncSelectFilter = {
  id: string;
  type: 'asyncSelect';
  label: string;
  value: AsyncSelectOption | null;
  loadOptions: NonNullable<AsyncSelectProps['loadOptions']>;
  onChange: (option: AsyncSelectOption | null) => void;
  placeholder?: string;
  defaultOptions?: boolean;
  pagination?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  className?: string;
  hidden?: boolean;
};

export type TableToolbarCustomFilter = {
  id: string;
  type: 'custom';
  render: () => ReactNode;
  className?: string;
  hidden?: boolean;
};

export type TableToolbarFilter =
  | TableToolbarSearchFilter
  | TableToolbarAsyncSelectFilter
  | TableToolbarCustomFilter;
