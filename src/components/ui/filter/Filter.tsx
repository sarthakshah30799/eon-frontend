import React, { useState } from 'react';
import { Input } from '../input';
import { Button } from '../button1';

interface FilterProps {
  onFiltersChange: (filters: Array<{ id: string; value: string }>) => void;
  columns: Array<{
    id: string;
    header: string;
  }>;
  className?: string;
}

export const Filter: React.FC<FilterProps> = ({
  onFiltersChange,
  columns,
  className = '',
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (columnId: string, value: string) => {
    const newActiveFilters = {
      ...activeFilters,
      [columnId]: value,
    };
    setActiveFilters(newActiveFilters);
    
    const filters = Object.entries(newActiveFilters)
      .filter(([, val]) => val.trim() !== '')
      .map(([key, val]) => ({ id: key, value: val }));
    
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    val => (val as string).trim() !== ''
  );

  const filterableColumns = columns.filter(
    column => column.id !== 'select' && column.id !== 'actions'
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {filterableColumns.map(column => (
          <div key={column.id} className="flex-1 min-w-[200px]">
            <Input
              label={column.header}
              placeholder={`Filter by ${column.header.toLowerCase()}...`}
              value={activeFilters[column.id] || ''}
              onChange={e => handleFilterChange(column.id, e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>
      
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-sm"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Filter;