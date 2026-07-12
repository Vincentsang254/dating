## July 2026

Added Login API

Added Register API

Created User model

Created JWT Middleware

Created Redux Auth Slice

Created Login Page

### Frontend import fixes

- Fixed broken customer header UI imports to use the shared UI aliases under the client source tree.
- Added missing shared ShadCN-style UI components for avatar, dropdown menu, sheet, label, and toaster to resolve frontend import errors.
- Added the missing dropdown menu label export required by the customer header.
- Kept application logic and layout structure unchanged while restoring import compatibility for the frontend build.

### Backend foundation and authentication

- Added a Sequelize Users model and wired it into the backend model registry.
- Implemented auth controller endpoints for register, login, load user, and logout.
- Added auth and user routes and registered them in the server bootstrap.
- Fixed the payment routes to use the existing authentication middleware.
- Added a health endpoint and basic error handling middleware for backend startup stability.
