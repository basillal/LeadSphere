# Node.js Backend Project

This README documents the complete development process of this Node.js backend project, from initial setup to a scalable MVC architecture with professional error handling.

## 🚀 Development Journey

### Phase 1: Project Initialization
The project started by defining the Node.js environment and installing necessary dependencies.
- **Commands**: `npm init -y`
- **Dependencies Installed**:
  - `express`: Web framework
  - `mongoose`: MongoDB ODM
  - `dotenv`: Environment variable management
  - `cors`: Cross-Origin Resource Sharing
  - `nodemon` (dev): Auto-restart server

### Phase 2: Database Connection
We established a connection to MongoDB using Mongoose.
- **File**: `src/config/db.js`
- **Logic**: Async function `connectDB` that connects via `MONGO_URI`.

### Phase 3: MVC Structure Setup
We organized the project into the **Model-View-Controller** pattern (API-focused, so no Views).
1.  **Model (`src/models/User.js`)**: Defined the User schema (name, email, createdAt).
2.  **Controller (`src/controllers/userController.js`)**: Implemented business logic (`getAllUsers`, `createUser`).
3.  **Routes (`src/routes/userRoutes.js`)**: Mapped HTTP endpoints (`GET /`, `POST /`) to controller functions.
4.  **App Entry (`src/app.js`)**: Wired middleware (`cors`, `express.json`) and routes together.

### Phase 4: Professional Refactoring (Latest Update)
To improve scalability and maintainability, we refactored the codebase to follow industry best practices.

#### Key Improvements:
1.  **Standardized API Responses**:
    - Created `src/utils/responseHandler.js`.
    - All endpoints now return a consistent structure: `{ success: true, message: "...", data: ... }`.
2.  **Global Error Handling**:
    - Created `src/middleware/errorHandler.js`.
    - Removed repetitive `try-catch` blocks from controllers.
    - Centralized error formatting.
3.  **Async Management**:
    - Implemented `express-async-handler` to cleaner async/await logic in controllers.
4.  **Input Validation**:
    - Added basic validation in `createUser` to ensure required fields exist before processing.

---

## 📂 Project Structure
```
/src
  /config
    └── db.js            # Database connection logic
  /controllers
    └── userController.js # Logic for handling requests
  /middleware
    └── errorHandler.js   # Global error handling
  /models
    └── User.js          # Mongoose schema
  /routes
    └── userRoutes.js    # API route definitions
  /utils
    └── responseHandler.js # Standardized response format
  app.js                 # App entry point
```

## 🛠️ How to Run

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Set Environment Variables**
    Create a `.env` file in the root:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    ```

3.  **Start Server**
    ```bash
    npm start
    ```

## 🔗 API Endpoints

| Method | Endpoint     | Description       | Body Parameters       |
| :----- | :----------- | :---------------- | :-------------------- |
| `GET`  | `/api/users` | Get all users     | None                  |
| `POST` | `/api/users` | Create specific user | `{ "name": "...", "email": "..." }` |
