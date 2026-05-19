import { apiClient } from '../api';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export const userApi = {
  getUsers: () => apiClient.get<User[]>('/users'),
  getUserById: (id: string) => apiClient.get<User>(`/users/${id}`),
  createUser: (data: CreateUserRequest) => apiClient.post<User>('/users', data),
  updateUser: (id: string, data: UpdateUserRequest) => apiClient.put<User>(`/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/users/${id}`),
};
