# Frontend Project Architecture

A modern React application built with Vite, TypeScript, and Tailwind CSS following a modular architecture pattern.

## 🚀 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with theme variants
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Yup validation
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier, Husky

## 📁 Folder Architecture

```
src/
├── pages/                    # Page components (lazy loaded)
│   ├── auth/                # Auth module pages
│   │   ├── login/          # Login page
│   │   │   ├── LoginPage.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── users/                # User module pages
│   │   ├── create/          # User creation page
│   │   │   ├── UserCreatePage.tsx
│   │   │   └── index.ts
│   │   ├── edit/            # User edit page
│   │   │   ├── [id]/        # Dynamic route for user ID
│   │   │   │   ├── UserEditPage.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── list/            # User list page
│   │   │   ├── UserListPage.tsx
│   │   │   └── index.ts
│   │   ├── detail/          # User detail page
│   │   │   ├── [id]/        # Dynamic route for user ID
│   │   │   │   ├── UserDetailPage.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
├── modules/                  # Feature-specific modules
│   ├── auth/                # Auth module
│   │   ├── views/            # Auth view components (UI/JSX logic)
│   │   │   ├── LoginView.tsx
│   │   │   └── index.ts
│   │   ├── forms/            # Auth form components (prop-based)
│   │   │   ├── LoginForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/             # Auth-specific custom hooks
│   │   │   ├── useLogin.ts
│   │   │   └── index.ts
│   │   ├── schema/            # Auth validation schemas
│   │   │   ├── authSchema.ts
│   │   │   └── index.ts
│   │   ├── types/             # Auth-specific types
│   │   │   ├── authTypes.ts
│   │   │   └── index.ts
│   │   ├── constants/          # Auth-specific constants
│   │   │   ├── authConstants.ts
│   │   │   └── index.ts
│   │   └── components/        # Auth components
│   │       └── index.ts
│   └── user/                # User module example
│       ├── components/        # User-specific UI components
│       │   ├── UserTable.tsx
│       │   ├── UserPreviewModal.tsx
│       │   └── index.ts
│       ├── hooks/             # User-specific custom hooks
│       │   ├── useCreateUser.ts
│       │   ├── useEditUser.ts
│       │   ├── useGetUser.ts
│       │   ├── useDeleteUser.ts
│       │   ├── useListUser.ts
│       │   └── index.ts
│       ├── forms/             # User-specific forms
│       │   ├── UserForm.tsx
│       │   └── index.ts
│       ├── create/            # Create user specific components
│       │   ├── UserCreateForm.tsx
│       │   └── index.ts
│       ├── edit/              # Edit user specific components
│       │   ├── UserEditForm.tsx
│       │   └── index.ts
│       ├── list/              # List user specific components
│       │   ├── UserList.tsx
│       │   └── index.ts
│       ├── detail/            # Detail user specific components
│       │   ├── UserDetail.tsx
│       │   └── index.ts
│       ├── utils/             # User-specific utilities
│       │   ├── userUtils.ts
│       │   └── index.ts
│       ├── schema/            # User validation schemas
│       │   ├── userSchema.ts
│       │   └── index.ts
│       ├── constants/          # User-specific constants
│       │   ├── userConstants.ts
│       │   └── index.ts
│       └── types/             # User-specific types
│           ├── userTypes.ts
│           └── index.ts
├── components/               # Global UI components
│   ├── ui/                  # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── layouts/              # Layout components
│   │   ├── DashboardLayout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── index.ts
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── forms/               # Global form components
│   │   ├── Form/
│   │   │   ├── Form.tsx
│   │   │   └── index.ts
│   │   ├── FormFieldInput/
│   │   │   ├── FormFieldInput.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
├── hooks/                   # Global custom hooks
│   ├── useTheme.ts
│   └── index.ts
├── utils/                   # Global utilities
│   ├── themeUtils.ts
│   └── index.ts
├── constants/               # Global constants
│   ├── themeConstants.ts
│   └── index.ts
├── types/                   # Global types
│   ├── themeTypes.ts
│   └── index.ts
├── lib/                     # Context, Providers, etc.
│   ├── QueryProvider.tsx
│   ├── ThemeProvider.tsx
│   ├── AuthProvider.tsx
│   └── index.ts
├── theme/                   # Tailwind theme configuration
│   ├── index.ts
│   └── theme.ts
├── api/                     # API integration layer
│   ├── api.ts               # Base API client
│   ├── auth/
│   │   ├── auth.api.ts       # Auth API endpoints
│   │   └── index.ts
│   ├── user/
│   │   ├── user.api.ts       # User API endpoints
│   │   └── index.ts
│   └── index.ts
└── index.css                # Global styles
```

## 🏗️ Architecture Rules

### Page Components
- **Location**: `src/pages/`
- **Purpose**: Page-level components that orchestrate layouts and module components
- **Rules**:
  - Must be lazy loaded using `React.lazy()`
  - Should only call module components (no JSX logic or business logic)
  - Can make API calls through module hooks
  - Maximum file size: 1000 lines
  - **Separation of Concerns**: Pages should only render module components, not contain JSX logic

### Module Components
- **Location**: `src/modules/{feature}/`
- **Purpose**: Feature-specific components, hooks, and business logic
- **Rules**:
  - Should only call API functions and UI components
  - Can use global UI components if reusable
  - Move to global level if used by multiple modules
  - Maximum file size: 1000 lines
  - **Sub-directories**:
    - `views/` - View components containing JSX logic and UI structure
    - `forms/` - Form components with prop-based interfaces
    - `hooks/` - Custom hooks for API operations and business logic
    - `schema/` - Validation schemas using Yup
    - `types/` - TypeScript interfaces and types
    - `constants/` - Feature-specific constants
    - `utils/` - Feature-specific utility functions

### Global Components
- **Location**: `src/components/`
- **Purpose**: Reusable UI components used across application
- **Rules**:
  - Must use Tailwind theme variants for styling
  - No custom CSS at component level
  - Use theme file with variants for styling
  - Maximum file size: 1000 lines
  - **Folder-based architecture**: Each component in its own folder
  - **camelCase folder names**: Use camelCase for component folders (e.g., `button/`, `input/`)
  - **Index exports**: Each folder must have `index.ts` for clean imports
  - **Default exports**: Components use `export default` and index re-exports as `default`

### Module Components
- **Location**: `src/modules/{feature}/components/`
- **Purpose**: Feature-specific UI components used within that module
- **Rules**:
  - Components specific to module functionality
  - Can use global components if reusable
  - Move to global level if used by multiple modules
  - Maximum file size: 1000 lines
  - Should not be used outside its module unless promoted to global

### API Layer
- **Location**: `src/api/`
- **Purpose**: API integration and data fetching
- **Rules**:
  - Use built-in fetch (no external HTTP libraries)
  - Wrap with React Query for state management
  - Don't use `useQuery`, `useMutation` directly in components
  - Create custom hooks for API operations

### Custom Hooks
- **Location**: `src/hooks/` and `src/modules/{feature}/hooks/`
- **Purpose**: Encapsulate business logic and API operations
- **Rules**:
  - All logic must be contained within the hook
  - Handle error states, loading states, and notifications internally
  - Components should only call hook methods with data
  - No try-catch blocks in components for hook operations
  - Return clean interface for components to use

### Types and Interfaces
- **Location**: `src/types/` and `src/modules/{feature}/types/`
- **Purpose**: Centralized type definitions
- **Rules**:
  - Use `interface` instead of `type` for object shapes
  - Interface names should start with capital letter (e.g., `UserFormData`)
  - Export types from dedicated types folder
  - Import types from types folder, not from schema or other locations
  - Use "I" prefix for interface names (e.g., `IUserFormData` is discouraged)

#### Hook Pattern Example
```typescript
// ❌ Wrong - Logic in component
const UserCreatePage = () => {
  const createUser = useCreateUser();
  
  const handleSubmit = async (data) => {
    try {
      await createUser.mutateAsync(data);
      toast.success('User created successfully!');
    } catch (error) {
      toast.error('Failed to create user');
    }
  };
  // ...
};

// ❌ Still Wrong - Component knows about mutation
const UserCreatePage = () => {
  const createUser = useCreateUser();
  
  const handleSubmit = (data) => {
    createUser.mutate(data);
  };
  // ...
};

// ✅ Correct - Component uses hook directly
const UserCreatePage = () => {
  const { handleSubmit, isPending } = useCreateUser();
  
  return (
    <UserForm onSubmit={handleSubmit} isLoading={isPending} />
  );
};

// Hook with encapsulated logic and handleSubmit
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await userApi.createUser(data);
        toast.success('User created successfully!');
        return response.data;
      } catch (error) {
        toast.error('Failed to create user');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return {
    ...mutation,
    handleSubmit,
    isPending: mutation.isPending,
  };
};
```

#### Auth Module Example
```typescript
// ✅ Correct - Login Page structure
// src/pages/auth/login/LoginPage.tsx
import React from 'react';
import { LoginView } from '../../../modules/auth/views';

const LoginPage: React.FC = () => {
  return <LoginView />;
};

// ✅ Correct - Login View contains JSX logic
// src/modules/auth/views/LoginView.tsx
import { LoginForm } from '../forms';
import { useLogin } from '../hooks';

export const LoginView: React.FC = () => {
  const { handleLogin, handleForgotPassword, isLoading, resolver } = useLogin();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* JSX logic and UI structure */}
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        onForgotPassword={handleForgotPassword}
        resolver={resolver}
      />
    </div>
  );
};

// ✅ Correct - LoginForm is prop-based
// src/modules/auth/forms/LoginForm.tsx
interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  isLoading?: boolean;
  onForgotPassword?: () => void;
  showRememberMe?: boolean;
  // ... other props
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  onForgotPassword,
  // ...props
}) => {
  return (
    <Form onSubmit={onSubmit} resolver={resolver}>
      <FormFieldInput name="email" label="Email" />
      <FormFieldInput name="password" label="Password" />
      <Button type="submit" disabled={isLoading}>Sign in</Button>
    </Form>
  );
};
```

### Router Configuration
- **Location**: `src/router/`
- **Purpose**: Centralized routing configuration
- **Rules**:
  - All routes defined in one place
  - Lazy loading for all pages
  - Suspense wrappers with loading states
  - Dynamic routes with parameters

#### Router Structure
```typescript
// src/router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy } from 'react';
import { Suspense } from 'react';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/login/LoginPage'));
const UserCreatePage = lazy(() => import('../pages/users/create/UserCreatePage'));
const UserListPage = lazy(() => import('../pages/users/list/UserListPage'));
const UserEditPage = lazy(() => import('../pages/users/edit/[id]/UserEditPage'));
const UserDetailPage = lazy(() => import('../pages/users/detail/[id]/UserDetailPage'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <UserListPage />,
  },
  {
    path: '/users/create',
    element: <UserCreatePage />,
  },
  {
    path: '/users/list',
    element: <UserListPage />,
  },
  {
    path: '/users/edit/:id',
    element: <UserEditPage />,
  },
  {
    path: '/users/:id',
    element: <UserDetailPage />,
  },
  // ... more routes
]);

export const AppRouter = () => {
  return (
    <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
```

#### App Integration
```typescript
// src/App.tsx
import { AppRouter } from './router';

function App() {
  return (
    <QueryProvider>
      <AppRouter />
      <Toaster />
    </QueryProvider>
  );
}
```

#### Router Rules
- **Location**: `src/router/`
- **Purpose**: Centralized routing configuration
- **Rules**:
  - All routes defined in one place
  - Lazy loading for all pages
  - Top-level Suspense wrapper for automatic loading behavior
  - No inline JSX in route definitions
  - Clean route elements without redundant Suspense
  - Dynamic routes with parameters using `:param` syntax
  - RouterProvider wrapper exported as `AppRouter`
  - No UI components or business logic in router

## 📋 Coding Standards

### File Size Limits
- **Maximum**: 1000 lines per file
- **Includes**: Code, comments, blank lines
- **Enforced**: ESLint rule `max-lines`

### Code Formatting
- **Tool**: Prettier
- **Configuration**: `.prettierrc`
- **Rules**:
  - 2 space indentation
  - Single quotes
  - Trailing commas (ES5)
  - 80 character line width
  - LF line endings

### Linting Rules
- **Tool**: ESLint
- **Configuration**: `.eslintrc.cjs`
- **Key Rules**:
  - TypeScript strict mode
  - React hooks exhaustive deps (warn)
  - No unused variables (error)
  - Function return type annotation (warn)
  - Prefer const (error)
  - No var statements (error)
  - **No unused code** - Throw error if any unused code is detected

### Static Text Management
- **Rule**: No static text should be inside JSX or TSX files
- **Location**: All static text must be in constant files
- **Purpose**: Centralized text management for easier maintenance and internationalization
- **Implementation**:
  - Create constants files in `constants/` directories
  - Export text constants with descriptive names
  - Import and use constants in components instead of inline text
  - Includes labels, placeholders, messages, titles, and any user-facing text

### Pre-commit Hooks
- **Tool**: Husky with lint-staged
- **Actions**:
  - Run ESLint with auto-fix
  - Run Prettier formatting
  - Block commit on errors

## 🎨 Styling Guidelines

### Tailwind CSS
- **Configuration**: `tailwind.config.js`
- **Theme**: Custom color palette with primary/secondary variants
- **Components**: Use class-variance-authority for variants

### Component Styling
- **Rule**: No custom CSS in components
- **Method**: Use Tailwind theme variants
- **Location**: All styling in theme configuration
- **Benefits**: Consistency, maintainability, theming support

### Theme Variants
```typescript
// Example component variant
const buttonVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-input',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

## 🔄 Lazy Loading

### Implementation
All pages must be lazy loaded using React.lazy():

```typescript
// Correct implementation
const UserCreatePage = lazy(() => import('./pages/UserCreatePage'));
const UserListPage = lazy(() => import('./pages/UserListPage'));

// With Suspense wrapper
<Suspense fallback={<div>Loading...</div>}>
  <UserCreatePage />
</Suspense>
```

### Benefits
- Reduced initial bundle size
- Improved initial load performance
- Code splitting by route/feature

## 📝 Form Handling

### React Hook Form + Yup
- **Validation**: Yup schemas in `schema/` folders
- **Components**: Reusable form components
- **Types**: TypeScript integration with schema inference

### Example Structure
```typescript
// Schema definition
const userSchema = yup.object({
  name: yup.string().required().min(2).max(50),
  email: yup.string().required().email(),
});

// Form component
const UserForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(userSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} error={errors.name?.message} />
      <Input {...register('email')} error={errors.email?.message} />
      <Button type="submit" disabled={isLoading}>Save</Button>
    </form>
  );
};
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Environment Variables
```bash
# API configuration
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📊 Performance Considerations

### Bundle Size
- Lazy loading for all pages
- Tree shaking for unused code
- Image optimization
- Code splitting by feature

### Runtime Performance
- React Query caching
- Memoization where appropriate
- Optimistic updates
- Error boundaries

## 🔧 Development Workflow

### Git Hooks
- Pre-commit: Lint and format
- Pre-push: Type checking
- CI/CD: Build and test

### Code Review Checklist
- [ ] File size under 1000 lines
- [ ] Proper TypeScript types
- [ ] Component variants used
- [ ] API error handling
- [ ] Loading states
- [ ] Accessibility considerations

## 📚 Best Practices

### Component Design
- Single responsibility principle
- Reusability through props
- Consistent naming conventions
- Proper error boundaries

### State Management
- Local state for UI state
- React Query for server state
- Context for global state
- Avoid prop drilling

### API Integration
- Custom hooks for API calls
- Error handling and retry logic
- Loading and error states
- Optimistic updates

## 🐛 Troubleshooting

### Common Issues
1. **TypeScript errors**: Check import paths and type definitions
2. **Styling issues**: Verify Tailwind configuration and variants
3. **Build failures**: Check file size limits and linting rules
4. **API errors**: Verify environment variables and endpoint configuration

### Debug Tips
- Use React DevTools for component state
- Check Network tab for API calls
- Verify console for linting warnings
- Use TypeScript strict mode for better error detection

---

## 📄 License

This project follows established architecture patterns and coding standards defined above. All contributors must adhere to these guidelines for consistency and maintainability.
# maraekat-frontend
