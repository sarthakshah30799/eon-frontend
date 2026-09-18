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

type TableToolbarAsyncSelectFilterBase = {
  id: string;
  type: 'asyncSelect';
  label: string;
  loadOptions: NonNullable<AsyncSelectProps['loadOptions']>;
  placeholder?: string;
  defaultOptions?: boolean;
  pagination?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  className?: string;
  hidden?: boolean;
};

export type TableToolbarSingleAsyncSelectFilter =
  TableToolbarAsyncSelectFilterBase & {
    isMulti?: false;
    value: AsyncSelectOption | null;
    onChange: (option: AsyncSelectOption | null) => void;
  };

export type TableToolbarMultiAsyncSelectFilter =
  TableToolbarAsyncSelectFilterBase & {
    isMulti: true;
    value: AsyncSelectOption[];
    onChange: (option: AsyncSelectOption[]) => void;
  };

export type TableToolbarAsyncSelectFilter =
  | TableToolbarSingleAsyncSelectFilter
  | TableToolbarMultiAsyncSelectFilter;

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
