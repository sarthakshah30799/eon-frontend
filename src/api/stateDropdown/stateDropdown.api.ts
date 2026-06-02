import { stateProfileApi } from '@/api/stateProfile';
import type { StateDropdownOption } from '@/modules/dropdowns/stateDropdown';

export const stateDropdownApi = {
  getStates: async (inputValue: string): Promise<StateDropdownOption[]> => {
    const query = inputValue.trim();
    const states = await stateProfileApi.getStateProfiles();

    return states
      .filter(state => {
        if (!query) {
          return true;
        }

        const search = query.toLowerCase();
        return (
          state.stateName.toLowerCase().includes(search) ||
          state.stateCode.toLowerCase().includes(search) ||
          state.gstStateCode.toLowerCase().includes(search) ||
          state.ctrStateCode.toLowerCase().includes(search)
        );
      })
      .map(state => ({
        value: state.stateName,
        label: state.stateName,
        stateId: state.id,
      }));
  },
};
