export const USER_ROLE_TEXTS = {
  LIST_TITLE: 'User Role',
  LIST_SUBTITLE: 'Manage roles, edit records, and keep access data organized.',
  RIGHTS_TITLE: 'User Rights',
  RIGHTS_SUBTITLE:
    'Control access to available options and manage permissions by action.',
  CREATE_ROLE: 'Create Role',
  SAVE_CHANGES: 'Save Changes',
  EDIT_ROLE: 'Edit Role',
  FORM_SUBTITLE: 'Fill in the role details and save the record.',
  LOADING_ROLES: 'Loading roles...',
  EMPTY_STATE: 'No roles found. Create your first role.',
  LIST_ERROR: 'Error loading roles',
  CREATE_SUCCESS: 'Role created successfully!',
  UPDATE_SUCCESS: 'Role updated successfully!',
  DELETE_SUCCESS: 'Role deleted successfully!',
  CREATE_ERROR: 'Failed to create role',
  UPDATE_ERROR: 'Failed to update role',
  DELETE_ERROR: 'Failed to delete role',
} as const;

export const USER_RIGHTS_PERMISSION_COLUMNS = [
  { key: 'add', label: 'Add' },
  { key: 'modify', label: 'Modify' },
  { key: 'delete', label: 'Delete' },
  { key: 'view', label: 'View' },
  { key: 'export', label: 'Export' },
  { key: 'authorized', label: 'Authorized' },
  { key: 'rejected', label: 'Rejected' },
] as const;
