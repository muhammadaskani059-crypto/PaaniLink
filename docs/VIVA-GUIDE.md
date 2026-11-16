# PaaniLink Phase 1 Viva Guide

## Explain Fetch in this project
The JavaScript module calls `fetch()` through the shared `api.js` helper. The browser sends an HTTP request to JSON Server. JSON Server reads `mock-api/db.json` and returns JSON. JavaScript receives the response, converts it with `response.json()`, and creates HTML for the page.

## Explain dynamic DOM
The records are not written as fixed table rows in HTML. The page starts with an empty content container. JavaScript loads records and builds table rows with template strings, then assigns the result to `innerHTML`.

## Demonstrate a live change
1. Start JSON Server and the frontend server.
2. Login as `officer@paanilink.test`.
3. Open Subsidy applications and approve a pending application.
4. Explain that the browser sent a PATCH request and then reloaded the collection.
5. Login as operator and assign a tanker/driver to an approved booking.
6. Login as driver and update the trip status.

## Likely questions
**Q: Why JSON Server?** It provides a simple REST-style mock API so the frontend can practise real Fetch requests before the backend exists.

**Q: What is the difference between GET and POST?** GET reads resources; POST creates a resource.

**Q: What is PATCH?** PATCH partially updates an existing resource.

**Q: Why is role-based UI not enough for security?** A user can modify browser code or send requests directly. The backend must verify identity and permissions for every request.

**Q: What is responsive design?** The layout adapts to different screen widths using flexible layouts, Bootstrap grid utilities and CSS media queries.

**Q: How is validation done?** HTML constraints such as `required`, `minlength`, `pattern` and `type=email` are checked with `reportValidity()`, with additional JavaScript business-rule checks.

**Q: What must be improved in Phase 2?** Secure authentication, server-side authorization, atomic quota/tanker/driver reservation, audit logs, payment integration and robust status-transition validation.
