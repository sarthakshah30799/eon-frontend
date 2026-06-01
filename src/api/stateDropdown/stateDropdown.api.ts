import { apiClient } from '@/api/api';
import type { StateDropdownOption, StateRecord } from '@/modules/dropdowns/stateDropdown';

const toStateOption = (state: StateRecord): StateDropdownOption => ({
  value: state.name,
  label: state.name,
  stateId: state.id,
});

export const stateDropdownApi = {
  getStates: async (inputValue: string): Promise<StateDropdownOption[]> => {
    const query = inputValue.trim();
    const endpoint = query
      ? `/states?search=${encodeURIComponent(query)}`
      : '/states';

    const response = await apiClient.get<StateRecord[]>(endpoint);

    if (response.error) {
      throw new Error(response.error);
    }

    return (response.data ?? []).map(toStateOption);
  },
};
