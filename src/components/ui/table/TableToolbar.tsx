import { Input } from '../input';
import { AsyncSelect } from '../asyncSelect';
import type { TableToolbarFilter } from './tableToolbar.types';

interface TableToolbarProps {
  filters: TableToolbarFilter[];
}

export const TableToolbar = ({ filters }: TableToolbarProps) => {
  const visibleFilters = filters.filter(filter => !filter.hidden);

  if (!visibleFilters.length) {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-wrap items-end gap-3">
      {visibleFilters.map(filter => {
        if (filter.type === 'search') {
          return (
            <div
              key={filter.id}
              className={filter.className ?? 'min-w-48 flex-1'}
            >
              <Input
                label={filter.label ?? 'Search'}
                placeholder={filter.placeholder ?? 'Search'}
                value={filter.value}
                onChange={event => filter.onChange(event.target.value)}
                valueTransform="none"
                classes={{ container: 'max-w-none! w-full' }}
              />
            </div>
          );
        }

        if (filter.type === 'asyncSelect') {
          return (
            <div
              key={filter.id}
              className={filter.className ?? 'w-48 shrink-0'}
            >
              <AsyncSelect
                label={filter.label}
                placeholder={filter.placeholder}
                value={filter.value}
                loadOptions={filter.loadOptions}
                defaultOptions={filter.defaultOptions ?? true}
                pagination={filter.pagination ?? true}
                isSearchable={filter.isSearchable ?? true}
                isClearable={filter.isClearable ?? true}
                isDisabled={filter.isDisabled}
                className="!max-w-none"
                onChange={option => {
                  const selectedOption = Array.isArray(option)
                    ? (option[0] ?? null)
                    : option;
                  filter.onChange(selectedOption);
                }}
              />
            </div>
          );
        }

        return (
          <div key={filter.id} className={filter.className ?? 'shrink-0'}>
            {filter.render()}
          </div>
        );
      })}
    </div>
  );
};

export default TableToolbar;
