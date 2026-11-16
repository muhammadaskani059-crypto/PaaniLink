# PaaniLink Use Case Diagram

The diagram is written in Mermaid. GitHub and many Markdown viewers can render it.

```mermaid
flowchart LR
  C[Customer] --> U1((Register / Login))
  C --> U2((Book tanker))
  C --> U3((Cancel booking))
  C --> U4((Apply for subsidy))
  C --> U5((View bills and history))
  C --> U6((Confirm delivery / dispute))
  O[Zone Officer] --> U7((Verify subsidy application))
  O --> U8((Approve / reject subsidised booking))
  O --> U9((Handle disputes))
  H[Hydrant Operator] --> U10((View approved bookings))
  H --> U11((Assign tanker and driver))
  H --> U12((Record filling and dispatch))
  D[Driver] --> U13((View assigned trips))
  D --> U14((Update arrived / delivered / failed))
  A[Administrator] --> U15((Manage users))
  A --> U16((Manage zones and hydrants))
  A --> U17((Manage tankers, rates and quotas))
  A --> U18((View city reports))
```

## Actors
Customer, Zone Officer, Hydrant Operator, Driver and Administrator.

## Key authorization rule
An actor may view a record without having permission to modify it. Authorization must be enforced by the Phase 2 API, not only by hiding frontend controls.
