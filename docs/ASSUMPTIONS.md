# PaaniLink – Assumptions and Ambiguities

1. **Commercial booking approval:** The assignment says commercial bookings need no approval. They are created as `Approved` and become eligible for hydrant dispatch.
2. **Subsidy eligibility:** A customer must have an approved subsidy application before a subsidised booking is accepted. In the demo, the application approval is checked in the UI.
3. **Monthly subsidy limit:** The brief states that a household has a monthly limit but does not give its value. The seed setting uses two subsidised bookings per month as a placeholder; the complete monthly counter is a Phase 2 rule to enforce server-side.
4. **Group variation:** The brief mentions validation including a group variation but does not define the variation. The project is structured for a group to add a group booking/customer type. Confirm the exact group fields with the instructor before final marking.
5. **Hydrant selection:** A customer can choose a hydrant in their own zone. A real implementation should filter to hydrants configured to serve the selected address zone.
6. **Tanker assignment:** The demo matches tanker capacity and hydrant, and selects an available driver. Phase 2 must also check overlapping trip times, driver shift, tanker maintenance and hydrant operating hours.
7. **Quota accounting:** The booking form checks current used quota plus requested gallons. Phase 2 must reserve quota atomically and release it on cancellation/failure where appropriate.
8. **Delivery confirmation:** The customer-facing confirmation/dispute controls are a planned extension; the seed UI currently demonstrates driver delivery updates and booking/bill viewing.
9. **Payments:** Bills are informational; no payment gateway or actual payment processing is included.
10. **Authentication/security:** Demo passwords and role data are intentionally mock data. No secure authentication, password hashing or server authorization exists in Phase 1.
11. **Tracking:** Live GPS tracking is not specified, so the project uses status-based trip tracking rather than a map.
12. **Failure reasons:** Driver must enter a reason when marking a trip failed.
