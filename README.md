# HomeTask SA (MVP 1)

Mobile-first booking marketplace for household micro-services in a single geographic area.

## Stack
- Backend: .NET 8 Web API (Clean Architecture)
<<<<<<< ours
<<<<<<< ours
- Database: PostgreSQL + Entity Framework Core
=======
- Database: PostgreSQL
>>>>>>> theirs
=======
- Database: PostgreSQL
>>>>>>> theirs
- Mobile: React Native (Expo)
- Auth: JWT + Mock OAuth bootstrap endpoint
- Payments: Mock escrow service

## Project Structure
- `backend/src/HomeTaskSA.Domain`: Entities + domain rules
- `backend/src/HomeTaskSA.Application`: CQRS-style request DTOs/services, interfaces, validators
<<<<<<< ours
<<<<<<< ours
- `backend/src/HomeTaskSA.Infrastructure`: EF Core DbContext, repositories, migrations, JWT/password/payment services
- `backend/src/HomeTaskSA.API`: Thin controllers + DI + auth
- `mobile`: Expo app entry
- `mobile/src`: Screens, components, API services, and shared styling
=======
- `backend/src/HomeTaskSA.Infrastructure`: EF Core DbContext, repositories, JWT/password/payment services
- `backend/src/HomeTaskSA.API`: Thin controllers + DI + auth
- `mobile`: Expo app
>>>>>>> theirs
=======
- `backend/src/HomeTaskSA.Infrastructure`: EF Core DbContext, repositories, JWT/password/payment services
- `backend/src/HomeTaskSA.API`: Thin controllers + DI + auth
- `mobile`: Expo app
>>>>>>> theirs

## Registration
### Customer registration (basic)
Required fields:
- email, password, role=Customer
- fullName, phoneNumber

### Service provider registration (extended + verification ready)
Required fields:
- email, password, role=ServiceProvider
- fullName, phoneNumber
- governmentIdNumber
- city, district, addressLine

Provider profile starts with `IsVerified=false` to support verification flow.

## OAuth (MVP)
`POST /api/auth/oauth` supports mocked OAuth login/registration for both roles. It links by `(provider, oauthSubject)` and can auto-create users if they do not exist.

## Booking Flow
Strict state machine in domain model:
`Pending -> Accepted -> InProgress -> Completed`

Payment status:
- On booking creation: `Held`
- On customer completion confirmation: `Released`

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/oauth`
- `GET /api/providers`
- `PUT /api/providers/rate`
- `POST /api/bookings`
- `GET /api/bookings/{userId}`
- `PUT /api/bookings/{id}/accept`
- `PUT /api/bookings/{id}/start`
- `PUT /api/bookings/{id}/complete`
- `POST /api/reviews`

## Setup
### Backend
1. Install .NET 8 SDK and PostgreSQL.
2. Update connection string in `backend/src/HomeTaskSA.API/appsettings.json`.
<<<<<<< ours
<<<<<<< ours
3. Apply EF Core migrations:
   ```bash
   dotnet ef database update --project backend/src/HomeTaskSA.Infrastructure --startup-project backend/src/HomeTaskSA.API
   ```
4. Run API:
   ```bash
   dotnet run --project backend/src/HomeTaskSA.API
   ```

The API also applies pending EF Core migrations on startup.

=======
=======
>>>>>>> theirs
3. Apply SQL migration from `backend/src/HomeTaskSA.Infrastructure/Migrations/0001_Initial.sql`.
4. Run API:
   ```bash
   cd backend/src/HomeTaskSA.API
   dotnet run
   ```

<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
Seed credentials:
- Customer: `customer@hometask.sa` / `Password123!`
- Provider: `provider@hometask.sa` / `Password123!`

### Mobile
1. Install Node 18+ and Expo CLI.
<<<<<<< ours
<<<<<<< ours
2. Create `mobile/.env` from `mobile/.env.example` and set `EXPO_PUBLIC_API_URL` if you are not using the default host.
3. Start app:
=======
2. Start app:
>>>>>>> theirs
=======
2. Start app:
>>>>>>> theirs
   ```bash
   cd mobile
   npm install
   npm start
   ```
<<<<<<< ours
<<<<<<< ours
4. The Expo source now lives under `mobile/src`.

Recommended API URLs:
- Android emulator: `http://10.0.2.2:5000/api`
- iOS simulator / same machine web: `http://localhost:5000/api`
- Physical device on your LAN: `http://<your-pc-ip>:5000/api`

`backend/src/HomeTaskSA.Infrastructure/Migrations/0001_Initial.sql` is now only a legacy bootstrap reference.
=======
3. Ensure API base URL in `mobile/App.js` points to your backend host.
>>>>>>> theirs
=======
3. Ensure API base URL in `mobile/App.js` points to your backend host.
>>>>>>> theirs


## Environment Notes (CI / restricted networks)
If package installs fail with `403 Forbidden`, your environment is likely behind a policy proxy.

- npm: configure your approved internal registry before install:
  ```bash
  npm config set registry <your-approved-registry>
  ```
- .NET SDK: install from your internal artifact mirror if `dotnet` is missing.

In this execution environment, outbound package repositories are blocked by policy, so dependency restore/build commands cannot complete until registry access is configured.

## Out of Scope
No chat, notifications, recurring bookings, admin dashboards, subscriptions, real payment integrations, or advanced search/filtering.
