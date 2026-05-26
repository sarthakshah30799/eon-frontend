export interface UserRoleFormValues {
  roleCode: string;
  roleName: string;
  isActive: boolean;
}

export interface UserRoleRecord extends UserRoleFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}

