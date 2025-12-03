# Backend Development Plan: Multiomic Data Orchestrator (MDO)

### 1️⃣ Executive Summary
- This document outlines the backend development plan for the Multiomic Data Orchestrator (MDO).
- The backend will be built using FastAPI (Python 3.13, async) and will use MongoDB Atlas as the database via the Motor library and Pydantic v2 models.
- The development will follow a dynamic sprint plan, covering all frontend-visible features.
- Constraints: No Docker, per-task manual testing, and a single `main` branch Git workflow.

### 2️⃣ In-Scope & Success Criteria
- **In-Scope Features:**
    - User Authentication (Login)
    - CSV Metadata Ingestion
    - Template-Driven Metadata Mapping
    - Harmonization and Validation Run
    - Offline Remediation via Validation Report
    - Gated Export of Harmonized Bundle
    - Saved Mappings Management
- **Success Criteria:**
    - All frontend features are fully functional end-to-end.
    - All task-level manual tests pass via the UI.
    - Each sprint's code is pushed to the `main` branch after successful verification.

### 3️⃣ API Design
- **Base Path:** `/api/v1`
- **Error Envelope:** `{ "error": "message" }`

- **Authentication:**
    - `POST /api/v1/auth/login`
        - **Purpose:** Authenticate a user and return a JWT.
        - **Request:** `{ "email": "user@example.com", "password": "password" }`
        - **Response:** `{ "token": "jwt_token" }`
        - **Validation:** Validate email format and password.
    - `GET /api/v1/auth/me`
        - **Purpose:** Get the current logged-in user's information.
        - **Request:** (Requires JWT)
        - **Response:** `{ "email": "user@example.com", "name": "Alex" }`

- **Harmonization Runs:**
    - `POST /api/v1/runs`
        - **Purpose:** Initiate a new harmonization and validation run.
        - **Request:** `FormData` with uploaded CSV files and mapping configuration JSON.
        - **Response:** `{ "run_id": "unique_run_id", "status": "pending" }`
    - `GET /api/v1/runs/{run_id}`
        - **Purpose:** Get the status and results of a harmonization run.
        - **Response:** `{ "run_id": "...", "status": "complete", "results": { ... } }`

- **Mapping Configurations:**
    - `GET /api/v1/mappings`
        - **Purpose:** Get all saved mapping configurations for the current user.
        - **Response:** `[{ "id": "...", "name": "My Mapping", ... }]`
    - `POST /api/v1/mappings`
        - **Purpose:** Save a new mapping configuration.
        - **Request:** `{ "name": "My Mapping", "mappings": [...] }`
        - **Response:** `{ "id": "...", "name": "My Mapping" }`
    - `DELETE /api/v1/mappings/{mapping_id}`
        - **Purpose:** Delete a saved mapping configuration.
        - **Response:** `204 No Content`

### 4️⃣ Data Model (MongoDB Atlas)
- **`users` collection:**
    - `_id`: ObjectId (auto-generated)
    - `email`: String (required, unique)
    - `password_hash`: String (required)
    - `name`: String
    - `created_at`: DateTime
    - **Example:** `{ "_id": ObjectId("..."), "email": "alex@mdo.com", "password_hash": "...", "name": "Alex" }`

- **`mapping_configurations` collection:**
    - `_id`: ObjectId (auto-generated)
    - `user_id`: ObjectId (reference to `users`)
    - `name`: String (required)
    - `mappings`: Array (of mapping objects)
    - `created_at`: DateTime
    - **Example:** `{ "_id": ObjectId("..."), "user_id": ObjectId("..."), "name": "Illumina Run Mapping", "mappings": [...] }`

- **`harmonization_runs` collection:**
    - `_id`: ObjectId (auto-generated)
    - `user_id`: ObjectId (reference to `users`)
    - `status`: String (`pending`, `running`, `complete`, `failed`)
    - `validation_issues`: Array
    - `created_at`: DateTime
    - `completed_at`: DateTime
    - **Example:** `{ "_id": ObjectId("..."), "user_id": ObjectId("..."), "status": "complete", "validation_issues": [...] }`

### 5️⃣ Frontend Audit & Feature Map
- **`/login` (LoginPage):**
    - **Purpose:** User authentication.
    - **Endpoint:** `POST /api/v1/auth/login`
    - **Models:** `User`

- **`/upload` (UploadPage):**
    - **Purpose:** Upload CSV files for a new run.
    - **Endpoint:** `POST /api/v1/runs` (initiates the run)
    - **Models:** `HarmonizationRun`

- **`/mapping` (MappingPage):**
    - **Purpose:** Map CSV columns to schema templates.
    - **Endpoints:** `POST /api/v1/runs`, `GET /api/v1/mappings`, `POST /api/v1/mappings`
    - **Models:** `MappingConfiguration`

- **`/validation` (ValidationPage):**
    - **Purpose:** Display validation results and allow export.
    - **Endpoint:** `GET /api/v1/runs/{run_id}`
    - **Models:** `HarmonizationRun`

- **`/dashboard` (Dashboard):**
    - **Purpose:** Display user info, recent runs, and saved mappings.
    - **Endpoints:** `GET /api/v1/auth/me`, `GET /api/v1/mappings`, `DELETE /api/v1/mappings/{mapping_id}`
    - **Models:** `User`, `MappingConfiguration`

### 6️⃣ Configuration & ENV Vars (core only)
- `APP_ENV`: `development`
- `PORT`: `8000`
- `MONGODB_URI`: (MongoDB Atlas connection string)
- `JWT_SECRET`: (A strong, secret key)
- `JWT_EXPIRES_IN`: `3600` (1 hour)
- `CORS_ORIGINS`: (Frontend URL, e.g., `http://localhost:5173`)

### 7️⃣ Background Work
- None required for MVP. All processing can be handled synchronously within the API requests.

### 8️⃣ Integrations
- None required for MVP.

### 9️⃣ Testing Strategy (Manual via Frontend)
- All backend functionality will be validated through manual testing on the frontend.
- Every task in the sprint plan includes a specific **Manual Test Step** and a **User Test Prompt**.
- Code will only be pushed to `main` after all tests for a given sprint have passed.

### 🔟 Dynamic Sprint Plan & Backlog

---

### S0 – Environment Setup & Frontend Connection

**Objectives:**
- Create FastAPI skeleton with `/api/v1` and `/healthz`.
- Connect to MongoDB Atlas using `MONGODB_URI`.
- `/healthz` performs a DB ping and returns a JSON status.
- Enable CORS for the frontend.
- Replace dummy API URLs in the frontend with real backend URLs.
- Initialize Git, set the default branch to `main`, and create a `.gitignore` file.

**Tasks:**
- **Task 0.1: Setup FastAPI Project**
  - **Manual Test Step:** Run `uvicorn main:app --reload`. The server should start without errors.
  - **User Test Prompt:** "Start the backend server and confirm it runs without crashing."
- **Task 0.2: Implement `/healthz` Endpoint**
  - **Manual Test Step:** Open `http://localhost:8000/healthz` in a browser. It should return `{"status": "ok", "db_status": "connected"}`.
  - **User Test Prompt:** "Access the /healthz endpoint and verify the database connection is successful."
- **Task 0.3: Connect Frontend to Backend**
  - **Manual Test Step:** Run the frontend dev server. The app should load without CORS errors in the browser console.
  - **User Test Prompt:** "Run the frontend and check the browser console for any CORS errors."

**Definition of Done:**
- Backend runs locally and connects to MongoDB Atlas.
- `/healthz` returns a success status.
- Frontend communicates with the backend without CORS issues.
- Code is pushed to the `main` branch on GitHub.

---

### S1 – Basic Auth & User Management

**Objectives:**
- Implement JWT-based login.
- Protect backend routes and frontend pages.
- Fetch and display user data.

**Tasks:**
- **Task 1.1: Implement `User` Model and Password Hashing**
  - **Manual Test Step:** Manually create a user in the database with a hashed password.
  - **User Test Prompt:** "Verify that a user can be created in the database with a properly hashed password."
- **Task 1.2: Implement `POST /api/v1/auth/login`**
  - **Manual Test Step:** Use the login form in the UI. A successful login should redirect to the dashboard.
  - **User Test Prompt:** "Log in with the test user credentials. You should be redirected to the dashboard."
- **Task 1.3: Implement `GET /api/v1/auth/me` and Protected Routes**
  - **Manual Test Step:** After logging in, the dashboard should display the user's name. Attempting to access the dashboard without logging in should redirect to the login page.
  - **User Test Prompt:** "Confirm the dashboard shows your username after login. Then, log out and try to access the dashboard directly; it should fail."

**Definition of Done:**
- User authentication flow is fully functional from the frontend.
- Protected routes are inaccessible to unauthenticated users.
- Code is pushed to `main`.

---

### S2 – Core Harmonization Workflow

**Objectives:**
- Implement the file upload and validation run initiation.
- Process uploaded CSVs and mapping configurations.
- Return mock validation results.

**Tasks:**
- **Task 2.1: Implement `POST /api/v1/runs` Endpoint**
  - **Manual Test Step:** On the "Upload" page, upload one or more CSV files and click "Proceed to Mapping".
  - **User Test Prompt:** "Upload a CSV file and proceed to the mapping step."
- **Task 2.2: Implement Harmonization Logic (Mocked)**
  - **Manual Test Step:** On the "Mapping" page, map the columns and click "Harmonize and Validate". The application should navigate to the "Validation" page.
  - **User Test Prompt:** "Complete the mapping step and start the validation. You should land on the validation results page."
- **Task 2.3: Return Validation Results**
  - **Manual Test Step:** The "Validation" page should display a summary of mock validation issues (Blockers, Warnings, Info).
  - **User Test Prompt:** "Verify that the validation page correctly displays the mock error counts."

**Definition of Done:**
- Users can complete the upload-map-validate workflow.
- The backend accepts file uploads and returns mock validation data.
- Code is pushed to `main`.

---

### S3 – Mapping Configuration Management

**Objectives:**
- Implement saving, loading, and deleting of mapping configurations.

**Tasks:**
- **Task 3.1: Implement `POST /api/v1/mappings`**
  - **Manual Test Step:** On the "Mapping" page, after completing a mapping, click "Save Mapping", provide a name, and save. A success toast should appear.
  - **User Test Prompt:** "Save a mapping configuration and confirm you see a success message."
- **Task 3.2: Implement `GET /api/v1/mappings`**
  - **Manual Test Step:** On the dashboard, the "Saved Mappings" card should list the newly saved mapping.
  - **User Test Prompt:** "Check the dashboard to ensure your saved mapping is listed."
- **Task 3.3: Implement `DELETE /api/v1/mappings/{mapping_id}`**
  - **Manual Test Step:** On the dashboard, click the delete icon next to a saved mapping and confirm the deletion. The mapping should be removed from the list.
  - **User Test Prompt:** "Delete the saved mapping from the dashboard and confirm it is removed."

**Definition of Done:**
- Full CRUD functionality for mapping configurations is working from the frontend.
- Code is pushed to `main`.