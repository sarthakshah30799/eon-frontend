import { apiClient } from '@/api/api';
import type { CountryDropdownOption, CountryRecord } from '@/modules/dropdowns/countryDropdown';

const toCountryOption = (country: CountryRecord): CountryDropdownOption => ({
  value: country.name,
  label: country.name,
  countryId: country.id,
});

export const countryDropdownApi = {
  getCountries: async (inputValue: string): Promise<CountryDropdownOption[]> => {
    const query = inputValue.trim();
    const endpoint = query
      ? `/countries?search=${encodeURIComponent(query)}`
      : '/countries';

    const response = await apiClient.get<CountryRecord[]>(endpoint);

    if (response.error) {
      throw new Error(response.error);
    }

    return (response.data ?? []).map(toCountryOption);
  },
};
