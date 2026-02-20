CREATE TABLE "Users" (
  "Id" uuid PRIMARY KEY,
  "Email" text NOT NULL UNIQUE,
  "PasswordHash" text NOT NULL,
  "Role" text NOT NULL
);

CREATE TABLE "ServiceProviderProfiles" (
  "UserId" uuid PRIMARY KEY REFERENCES "Users"("Id") ON DELETE CASCADE,
  "HourlyRate" numeric NOT NULL,
  "IsVerified" boolean NOT NULL DEFAULT false
);

CREATE TABLE "Bookings" (
  "Id" uuid PRIMARY KEY,
  "CustomerId" uuid NOT NULL REFERENCES "Users"("Id"),
  "ServiceProviderId" uuid NOT NULL REFERENCES "Users"("Id"),
  "Date" timestamp with time zone NOT NULL,
  "DurationHours" integer NOT NULL,
  "Description" text NOT NULL,
  "TotalAmount" numeric NOT NULL,
  "Status" text NOT NULL,
  "PaymentStatus" text NOT NULL
);

CREATE TABLE "Reviews" (
  "Id" uuid PRIMARY KEY,
  "BookingId" uuid NOT NULL UNIQUE REFERENCES "Bookings"("Id") ON DELETE CASCADE,
  "Rating" integer NOT NULL,
  "Comment" text NOT NULL
);

INSERT INTO "Users" ("Id", "Email", "PasswordHash", "Role") VALUES
('11111111-1111-1111-1111-111111111111', 'customer@hometask.sa', '$2a$11$qfPeq8YgA6jVS9uI95sy4uNQiT/GOj9j7dihf9Yf41hXvA6xQnAUW', 'Customer'),
('22222222-2222-2222-2222-222222222222', 'provider@hometask.sa', '$2a$11$qfPeq8YgA6jVS9uI95sy4uNQiT/GOj9j7dihf9Yf41hXvA6xQnAUW', 'ServiceProvider');

INSERT INTO "ServiceProviderProfiles" ("UserId", "HourlyRate", "IsVerified") VALUES
('22222222-2222-2222-2222-222222222222', 120, false);
