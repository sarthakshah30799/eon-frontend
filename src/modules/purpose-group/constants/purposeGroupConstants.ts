export const PURPOSE_GROUP_TEXTS = {
  LIST_TITLE: 'Purpose Group Master',
  LIST_SUBTITLE:
    'Group sell purposes for FFMC and AD. Sort order controls the row order in the FLM 8 sell section.',
  CREATE_TITLE: 'Create Purpose Group',
  EDIT_TITLE: 'Edit Purpose Group',
  CREATE_BUTTON: 'Create Purpose Group',
  SAVE_CHANGES: 'Save Changes',
  SAVE_GROUP: 'Save Purpose Group',
  CREATE_SUCCESS: 'Purpose group created successfully!',
  CREATE_ERROR: 'Failed to create purpose group',
  UPDATE_SUCCESS: 'Purpose group updated successfully!',
  UPDATE_ERROR: 'Failed to update purpose group',
  DELETE_SUCCESS: 'Purpose group deleted successfully!',
  DELETE_ERROR: 'Failed to delete purpose group',
  LIST_ERROR: 'Error loading purpose groups',
  EMPTY_STATE: 'No purpose groups found. Create your first purpose group.',
  NAME: 'Group name',
  TITLE: 'Report title',
  PROFILE_TYPE: 'Profile type',
  SORT_ORDER: 'Sort order',
  SORT_ORDER_PLACEHOLDER: '1',
  PURPOSES: 'Sell purposes',
  FFMC: 'FFMC',
  AD: 'AD',
} as const;

export const PURPOSE_GROUP_PROFILE_TYPE_OPTIONS = [
  { value: 'FFMC', label: 'FFMC' },
  { value: 'AD', label: 'AD' },
] as const;
