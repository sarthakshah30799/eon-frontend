import type {
  AsyncSelectOption,
  AsyncSelectProps,
} from '../asyncSelect/AsyncSelect';
import type { TableToolbarFilter } from './tableToolbar.types';

export const buildSearchToolbarFilter = (config: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  hidden?: boolean;
}): TableToolbarFilter => ({
  id: config.id ?? 'search',
  type: 'search',
  label: config.label ?? 'Search',
  value: config.value,
  onChange: config.onChange,
  placeholder: config.placeholder,
  className: config.className ?? 'min-w-48 flex-1',
  hidden: config.hidden,
});

export const buildBranchToolbarFilter = (config: {
  id?: string;
  visible?: boolean;
  label?: string;
  value: AsyncSelectOption | null;
  loadOptions: NonNullable<AsyncSelectProps['loadOptions']>;
  onChange: (option: AsyncSelectOption | null) => void;
  placeholder?: string;
  className?: string;
}): TableToolbarFilter => ({
  id: config.id ?? 'branch',
  type: 'asyncSelect',
  label: config.label ?? 'Branch',
  value: config.value,
  loadOptions: config.loadOptions,
  onChange: config.onChange,
  placeholder: config.placeholder ?? 'All Branches',
  defaultOptions: true,
  pagination: true,
  isSearchable: true,
  isClearable: true,
  hidden: config.visible === false,
  className: config.className ?? 'w-48 shrink-0',
});

export const buildStaticAsyncSelectToolbarFilter = (config: {
  id: string;
  label: string;
  options: AsyncSelectOption[];
  value: AsyncSelectOption | null;
  onChange: (option: AsyncSelectOption | null) => void;
  placeholder?: string;
  className?: string;
  hidden?: boolean;
}): TableToolbarFilter => ({
  id: config.id,
  type: 'asyncSelect',
  label: config.label,
  value: config.value,
  loadOptions: async (inputValue: string) => {
    const normalizedInput = inputValue.trim().toLowerCase();
    const options = normalizedInput
      ? config.options.filter(
          option =>
            option.label.toLowerCase().includes(normalizedInput) ||
            String(option.value).toLowerCase().includes(normalizedInput)
        )
      : config.options;

    return { options };
  },
  onChange: config.onChange,
  placeholder: config.placeholder ?? 'All',
  defaultOptions: true,
  pagination: false,
  isSearchable: true,
  isClearable: true,
  hidden: config.hidden,
  className: config.className ?? 'w-40 shrink-0',
});
