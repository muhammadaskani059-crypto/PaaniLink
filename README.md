# PaaniLink – Phase 1 Frontend

A responsive frontend demonstration for the Water Tanker Booking and Dispatch System. It uses HTML, CSS, Bootstrap 5, JavaScript Fetch and JSON Server as a mock REST API.

## Requirements
- Node.js (LTS)
- npm
- A modern browser

## Run the project
1. Extract the project folder.
2. Open a terminal in the `PaaniLink` folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the mock API in terminal 1:
   ```bash
   npm run api
   ```
   JSON Server runs at `http://localhost:3000`.
5. Start the static frontend server in terminal 2:
   ```bash
   npm run serve
   ```
6. Open `http://localhost:8080`.

Do not open HTML files directly with `file://`; ES modules and Fetch should be served over HTTP.

## Demo logins
All demo passwords are `123456`.
- Customer: customer@paanilink.test
- Zone Officer: officer@paanilink.test
- Hydrant Operator: operator@paanilink.test
- Driver: driver@paanilink.test
- Administrator: admin@paanilink.test

## Main flow
Customer creates a booking. Commercial bookings enter Approved status; subsidised bookings enter Pending Approval. A Zone Officer approves/rejects subsidised bookings. A Hydrant Operator assigns a matching available tanker and available driver. The assigned Driver updates the trip to Arrived, Delivered or Failed. The customer can view their booking and bill.

## Technical flow for viva
Browser page -> JavaScript module -> `fetch()` -> JSON Server REST endpoint -> JSON response -> JavaScript render function -> DOM update.

## Important limitations
This is a Phase 1 mock environment, not production software. Demo credentials are stored in `mock-api/db.json`; this is intentionally not secure. Role checks in the frontend are demonstration-only and can be bypassed. A real Phase 2 backend must enforce authentication, authorization, validation, transaction safety, quota locking and audit logging on the server.

## Notes
- Data is stored by JSON Server in `mock-api/db.json`.
- Reset demo data by restoring the original `db.json` if required.
- The current implementation demonstrates Fetch GET, POST and PATCH operations. DELETE is available through the shared API helper but not exposed as a destructive user action.
