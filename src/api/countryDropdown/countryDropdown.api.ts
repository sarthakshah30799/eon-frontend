import { countryProfileApi } from '@/api/countryProfile';
import type { CountryDropdownOption } from '@/modules/dropdowns/countryDropdown';

export const countryDropdownApi = {
  getCountries: async (inputValue: string): Promise<CountryDropdownOption[]> => {
    const query = inputValue.trim();
    const countries = await countryProfileApi.getCountryProfiles();

    return countries
      .filter(country => {
        if (!query) {
          return true;
        }

        const search = query.toLowerCase();
        return (
          country.countryName.toLowerCase().includes(search) ||
          country.countryCode.toLowerCase().includes(search)
        );
      })
      .map(country => ({
        value: country.countryName,
        label: country.countryName,
        countryId: country.id,
      }));
  },
};
