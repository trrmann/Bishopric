# dev-server Structure and Conventions

## Overview
This folder contains the backend server code and related assets for the project. The structure is designed for scalability, maintainability, and clarity.

## Folder Structure
- **controllers/**: Route handlers, organized by feature/domain.
- **models/**: Data models, organized by feature/domain.
- **routes/**: Express route definitions, organized by feature/domain.
- **database/**: Database connection and query logic.
  - **sql/**: SQL-specific files (connection, queries, etc.).
- **public/**: Static assets served to the client.
  - **images/**, **scripts/**, **styles/**, **modules/**: Organize as needed.
- **views/**: Templating files for server-side rendering.
  - **layouts/**, **partials/**, and feature-specific folders.
- **config/**: Environment and app configuration files.
- **server.js**: Main server entry point.

## Conventions
- Use plural names for folders (controllers, models, routes).
- Group files by feature/domain when possible (e.g., user, org).
- Place environment-specific settings in `config/`.
- Add new features as subfolders in controllers, models, and routes.
- Keep static assets in `public/`.

## Example Feature Organization
```
controllers/
  userController.js
  orgController.js
models/
  userModel.js
  orgModel.js
routes/
  userRoutes.js
  orgRoutes.js
```

## Notes
- Remove or flatten folders if they only contain one file or are unlikely to grow.
- Update this README as the project evolves.
