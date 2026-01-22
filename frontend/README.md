# React Frontend Project Documentation

## 1. Project Overview
This project is a modern **React application** bootstrapped with **Vite**. It serves as the user interface for the Node.js application, providing a responsive and structured way for users to interact with the backend services.

## 2. Technology Stack
This project leverages the following key technologies and libraries:

- **Core**:
  - [React 19](https://react.dev/) - The library for web and native user interfaces.
  - [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling (Build tool & Dev Server).
- **Routing**:
  - [React Router v7](https://reactrouter.com/) - Client-side routing for navigating between pages without reloading.
- **UI & Styling**:
  - [Material UI (MUI)](https://mui.com/) - A comprehensive library of UI components implementing Google's Material Design.
  - [Lucide React](https://lucide.dev/) - Beautiful, consistent icons.
  - Vanilla CSS - For global resets and custom styling tweaks.

## 3. Installed Dependencies & Rationale
Below is a list of all dependencies installed in `package.json` and the specific reason they are included in this project.

### Production Dependencies
These libraries are compiled into the final application bundle.

| Package | Purpose |
| :--- | :--- |
| **`react`** | The core library for building the component-based user interface. |
| **`react-dom`** | The bridge between React and the browser's DOM. It handles rendering the app to the web page. |
| **`react-router-dom`** | Manages navigation and URL handling. It enables the Single Page Application (SPA) behavior where the page doesn't fully reload on link clicks. |
| **`@mui/material`** | Provides pre-built, accessible React components (like Buttons, Grid, AppBar) following Google's Material Design system, speeding up UI development. |
| **`@emotion/react` & `@emotion/styled`** | Peer dependencies required by Material UI. They provide the CSS-in-JS styling engine that powers MUI's component styling and customization system. |
| **`@mui/icons-material`** | The official icon set for Material UI, providing thousands of SVG icons as React components. |
| **`lucide-react`** | A modern, lightweight icon library. Used as an alternative style of icons where standard Material icons might not fit the desired aesthetic. |

### Development Dependencies
These tools are only used during development (building, linting, testing) and do not appear in the production code.

| Package | Purpose |
| :--- | :--- |
| **`vite`** | The build tool and development server. It provides specific features like Hot Module Replacement (HMR) for instant updates during coding. |
| **`@vitejs/plugin-react`** | Use with Vite to enable Fast Refresh and automatic JSX transformation for React. |
| **`eslint`** | A static code analysis tool to identify problematic patterns and enforce code quality rules. |
| **`eslint-plugin-react-hooks`** | Enforces the rules of Hooks (e.g., preventing hooks from being called inside loops), which are critical for preventing React bugs. |
| **`eslint-plugin-react-refresh`** | Helps validate that components can largely be safely hot-reloaded by React Refresh. |
| **`globals`** | A library to provide global variable definitions for ESLint, so it knows about browser-specific globals like `window` and `document`. |

## 4. Project Hierarchy
The source code is organized clearly in the `src` folder. Here is the high-level structure:

```text
src/
├── assets/          # Static assets like images and global fonts
├── components/      # Reusable UI building blocks
│   ├── common/      # Generic components (Buttons, Inputs, etc.)
│   └── layout/      # Structural components (Header, Sidebar, Footer)
├── layouts/         # Page layout wrappers
│   └── MainLayout.jsx  # The primary layout frame (Sidebar + Header + Content)
├── pages/           # Full-page views
│   ├── Home.jsx
│   ├── About.jsx
│   └── Contact.jsx
├── styles/          # Styling files
│   ├── global.css   # Global resets and variables
│   └── App.css      # App-specific styles
├── routes/          # (Optional) Route definitions if separated
├── services/        # API service calls (fetching data from backend)
├── App.jsx          # Main Application Component & Router Configuration
└── main.jsx         # Entry Point (Bootstraps the app)
```

## 5. Implementation Details

### **Entry Point (`src/main.jsx`)**
This is where the React application starts (bootstraps).
- It selects the standard HTML root element (`#root`).
- It renders the `<App />` component inside React's `StrictMode`.
- It imports `global.css` for app-wide styling resets.

### **Routing & Navigation (`src/App.jsx`)**
The `App.jsx` file is the heart of the navigation logic.
- It uses `BrowserRouter` to enable client-side routing.
- It defines `Routes` that map URL paths to specific **Pages**.
- **Nested Routing**: It uses a nested route structure where `MainLayout` acts as a parent for standard pages.
  ```jsx
  <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />      {/* Matches "/" */}
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
  </Route>
  ```

### **Layout System (`src/layouts/MainLayout.jsx`)**
The `MainLayout` ensures a consistent look and feel across the application.
- It permanently renders the **Header** and **Sidebar** components.
- It uses the React Router `<Outlet />` component to dynamically modify the content area based on the current URL.
- This prevents the Header/Sidebar from re-rendering or flickering when navigating between pages.

## 6. Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

### Running the Development Server
Start the local development server:
```bash
npm run dev
```
The app will typically be accessible at `http://localhost:5173`.
