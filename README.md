# HomeTask SA (MVP 1)

Mobile-first booking marketplace for household micro-services in a single geographic area.

## Stack
- Backend: .NET 8 Web API (Clean Architecture)
- Database: PostgreSQL
- Mobile: React Native (Expo)
- Auth: JWT
- Payments: Mock escrow service

## Project Structure
- `backend/src/HomeTaskSA.Domain`: Entities + domain rules
- `backend/src/HomeTaskSA.Application`: CQRS-style request DTOs/services, interfaces, validators
- `backend/src/HomeTaskSA.Infrastructure`: EF Core DbContext, repositories, JWT/password/payment services
- `backend/src/HomeTaskSA.API`: Thin controllers + DI + auth
- `mobile`: Expo app

## Booking Flow
Strict state machine in domain model:
`Pending -> Accepted -> InProgress -> Completed`

Payment status:
- On booking creation: `Held`
- On customer completion confirmation: `Released`

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
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
3. Apply SQL migration from `backend/src/HomeTaskSA.Infrastructure/Migrations/0001_Initial.sql`.
4. Run API:
   ```bash
   cd backend/src/HomeTaskSA.API
   dotnet run
   ```

Seed credentials:
- Customer: `customer@hometask.sa` / `Password123!`
- Provider: `provider@hometask.sa` / `Password123!`

### Mobile
1. Install Node 18+ and Expo CLI.
2. Start app:
   ```bash
   cd mobile
   npm install
   npm start
   ```
3. Ensure API base URL in `mobile/App.js` points to your backend host.

## Out of Scope
No chat, notifications, recurring bookings, admin dashboards, subscriptions, real payment integrations, or advanced search/filtering.
