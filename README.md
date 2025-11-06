# React Authentication Module

A complete authentication system built with React, TypeScript, React Hook Form, Yup validation, and JWT authentication with httpOnly cookies.

## Features

- ✅ **Signup Page** with form validation
- ✅ **Login Page** with form validation  
- ✅ **JWT Authentication** with httpOnly cookies
- ✅ **Protected Routes** with automatic redirects
- ✅ **Form Validation** using Yup schemas
- ✅ **React Hook Form** for efficient form handling
- ✅ **Axios Configuration** with interceptors
- ✅ **Authentication Context** with React Context API
- ✅ **TypeScript** for type safety
- ✅ **Responsive Design** with modern CSS
- ✅ **Loading States** and error handling

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Forms**: React Hook Form, Yup validation
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM v6
- **State Management**: React Context API + useReducer
- **Styling**: CSS3 with modern features
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AuthForms.css
│   ├── Dashboard.tsx
│   └── Dashboard.css
├── context/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── services/
│   ├── api.ts
│   └── authService.ts
├── types/
│   └── auth.ts
├── validations/
│   └── authSchemas.ts
├── App.tsx
├── App.css
└── main.tsx
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Backend API Requirements

Your backend should implement these endpoints:

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (sets httpOnly cookie)
- `POST /api/auth/logout` - User logout (clears cookie)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token (optional)

### Expected Request/Response Format

#### Signup Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Signup Response
```json
{
  "success": true,
  "message": "Account created successfully"
}
```

#### Login Request
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Get User Response
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Configuration

### Vite Configuration
The project is configured to proxy API requests to `http://localhost:5000`. Update `vite.config.ts` if your backend runs on a different port:

```typescript
export default defineConfig({
  // ...
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:YOUR_BACKEND_PORT',
        changeOrigin: true,
      }
    }
  }
})
```

### Path Aliases
The project uses TypeScript path mapping for cleaner imports:

- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/services/*` → `src/services/*`
- `@/types/*` → `src/types/*`
- `@/utils/*` → `src/utils/*`
- `@/validations/*` → `src/validations/*`

## Form Validation Rules

### Signup Form
- **Name**: Required, 2-50 characters
- **Email**: Required, valid email format
- **Password**: Required, minimum 8 characters with:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### Login Form
- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters

## Authentication Flow

1. **Initial Load**: Check if user is authenticated via `/api/auth/me`
2. **Login**: Send credentials to `/api/auth/login`, receive httpOnly cookie
3. **Protected Routes**: Automatically redirect to login if not authenticated
4. **API Requests**: Include cookies automatically with `withCredentials: true`
5. **Logout**: Clear server-side session and local state

## Security Features

- **httpOnly Cookies**: JWT stored in httpOnly cookies (not accessible via JavaScript)
- **CSRF Protection**: Cookies sent with `withCredentials: true`
- **Form Validation**: Client-side validation with Yup schemas
- **Error Handling**: Comprehensive error handling with user feedback
- **Auto-redirect**: Automatic redirects for protected routes

## Customization

### Styling
All styles are in CSS files. Key files:
- `AuthForms.css` - Login/Signup form styles
- `Dashboard.css` - Dashboard component styles
- `App.css` - Global app styles

### Validation
Update validation schemas in `src/validations/authSchemas.ts`:

```typescript
export const signupSchema = yup.object({
  // Add your custom validation rules
});
```

### API Configuration
Update API configuration in `src/services/api.ts`:

```typescript
const api = axios.create({
  baseURL: '/api', // Change base URL
  timeout: 10000,  // Adjust timeout
  // Add custom headers
});
```

## Error Handling

The application includes comprehensive error handling:

- **Form Validation Errors**: Displayed inline with form fields
- **Server Errors**: Displayed as alert messages
- **Network Errors**: Handled by Axios interceptors
- **Authentication Errors**: Automatic redirect to login

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
