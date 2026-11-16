# PaaniLink Mock API Contract

Base URL: `http://localhost:3000`

JSON Server exposes collection endpoints. IDs are numeric. Content type is `application/json`.

| Resource | Method | Endpoint | Purpose |
|---|---|---|---|
| Users | GET | `/users` | Demo sign-in and account lookup |
| Users | POST | `/users` | Register customer |
| Zones | GET | `/zones` | Load service zones |
| Hydrants | GET | `/hydrants` | Load hydrants and quotas |
| Tankers | GET | `/tankers` | Load tanker inventory |
| Drivers | GET | `/drivers` | Load driver availability |
| Rates | GET | `/rates` | Load commercial/subsidised rates |
| Bookings | GET | `/bookings` | Load bookings |
| Bookings | POST | `/bookings` | Create booking |
| Bookings | PATCH | `/bookings/:id` | Change booking status or assignment |
| Subsidy applications | GET | `/subsidyApplications` | List applications |
| Subsidy applications | POST | `/subsidyApplications` | Submit subsidy application |
| Subsidy applications | PATCH | `/subsidyApplications/:id` | Approve/reject application |
| Trips | GET | `/trips` | List trips |
| Trips | POST | `/trips` | Create dispatched trip |
| Trips | PATCH | `/trips/:id` | Update delivery status |
| Bills | GET | `/bills` | List bills |
| Disputes | GET | `/disputes` | List disputes |
| Disputes | PATCH | `/disputes/:id` | Resolve dispute |

## Example: create booking
`POST /bookings`
```json
{
  "customerId": 1,
  "customerName": "Ayesha Khan",
  "zoneId": 1,
  "hydrantId": 1,
  "capacity": 3000,
  "type": "commercial",
  "status": "Approved",
  "date": "2026-11-20",
  "address": "Block 7, Gulshan-e-Iqbal",
  "amount": 4000,
  "tankerId": null,
  "driverId": null
}
```

## Example: update trip
`PATCH /trips/1`
```json
{ "status": "Arrived" }
```

## Status vocabulary
- Booking: `Pending Approval`, `Approved`, `Rejected`, `Dispatched`, `Arrived`, `Delivered`, `Failed`, `Cancelled`
- Subsidy application: `Pending`, `Approved`, `Rejected`
- Trip: `Dispatched`, `Arrived`, `Delivered`, `Failed`
- Resource: `Available`, `Assigned`, `Unavailable`

## Phase 2 contract expectations
A production API should add authenticated endpoints, server-side role enforcement, pagination/filtering, consistent error objects, idempotency for booking submission, database transactions for dispatch/quota reservation, and audit history. Do not trust client-supplied prices, user IDs, role names or status transitions.
