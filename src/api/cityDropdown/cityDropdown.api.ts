import { apiClient } from '@/api/api';
import type { CityDropdownOption, CityRecord } from '../../modules/dropdowns/cityDropdown/types/cityDropdown.types';

const toCityOption = (city: CityRecord): CityDropdownOption => ({
  value: city.name,
  label: city.name,
  cityId: city.id,
});

export const cityDropdownApi = {
  getCities: async (inputValue: string): Promise<CityDropdownOption[]> => {
    const query = inputValue.trim();
    const endpoint = query
      ? `/cities?search=${encodeURIComponent(query)}`
      : '/cities';

    const response = await apiClient.get<CityRecord[]>(endpoint);

    if (response.error) {
      throw new Error(response.error);
    }

    return (response.data ?? []).map(toCityOption);
  },
};
