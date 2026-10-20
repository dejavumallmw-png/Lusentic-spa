# Security Specification & Test Matrix

## 1. Data Invariants
1. **Public Catalog Visibility**: Treatments, Therapists, Articles, Gallery Items, Testimonials, and Site Settings are publicly readable so guests and clients can view treatments and book appointments.
2. **Catalog Write Isolation**: Only authenticated Admins can create, update, or delete Treatments, Therapists, Articles, Gallery photos, or Site Settings.
3. **User Profile Protection**: Users can only read and write their own profile document (`/users/{userId}`). Role escalation (changing role to `admin`) by clients is strictly forbidden.
4. **Booking Integrity**:
   - Clients can create bookings with valid fields and read their own bookings.
   - Admins can read all bookings and update statuses.
   - Cancellation/updates can only alter allowable fields.
5. **Denial of Wallet & Injection Guards**: All string fields are constrained with `.size() <= MAX` and ID fields match `^[a-zA-Z0-9_\-]+$`.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Payload 1 (Ghost Field Injection)**: Attempt to write `{ ...validTreatment, maliciousBackdoor: true }` into `/treatments/101`. Expected: `PERMISSION_DENIED`.
2. **Payload 2 (Unauthenticated Catalog Write)**: Unauthenticated visitor attempting to `create` a treatment in `/treatments/999`. Expected: `PERMISSION_DENIED`.
3. **Payload 3 (Role Escalation)**: Client attempting to set `role: "admin"` on their own user profile `/users/client_123`. Expected: `PERMISSION_DENIED`.
4. **Payload 4 (Profile Impersonation)**: Authenticated user `user_A` attempting to read `/users/user_B`. Expected: `PERMISSION_DENIED`.
5. **Payload 5 (Oversized Payload / Denial of Wallet)**: Booking with notes string exceeding 1,000 characters. Expected: `PERMISSION_DENIED`.
6. **Payload 6 (Oversized Document ID)**: Attempting to write to `/treatments/` with an ID length > 128 characters or special control characters. Expected: `PERMISSION_DENIED`.
7. **Payload 7 (Unauthenticated Article Delete)**: Non-admin attempting to delete `/articles/art_1`. Expected: `PERMISSION_DENIED`.
8. **Payload 8 (Foreign Booking Query / Query Scraping)**: Client attempting to query all bookings without filtering by their own user ID. Expected: `PERMISSION_DENIED`.
9. **Payload 9 (Testimonial Star Rating Out of Bounds)**: Testimonial submitted with `stars: 10` or `stars: -1`. Expected: `PERMISSION_DENIED`.
10. **Payload 10 (Negative Treatment Price)**: Attempting to create a treatment with `price: -500`. Expected: `PERMISSION_DENIED`.
11. **Payload 11 (Tampered Booking Client Name)**: Client altering `bookingId` or `treatmentId` after creation. Expected: `PERMISSION_DENIED`.
12. **Payload 12 (Admin Bypass Spoofing)**: Client sending a mock claim without admin authorization in the database or admin email match. Expected: `PERMISSION_DENIED`.
