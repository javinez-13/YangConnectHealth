# Admin Portal Documentation

## Overview

The Admin Portal provides comprehensive management capabilities for the Healthcare Website. It follows the same modern design principles as the patient portal but focuses on system oversight, user management, and configuration.

## Access

**URL:** `/admin/dashboard`

**Requirements:**
- User must be logged in
- User must have `role: 'admin'` in the database

## Features

### 1. Admin Dashboard (`/admin/dashboard`)

**System Health & KPIs:**
- Total Patients count with weekly growth
- Appointments Today with scheduled count
- Total Providers
- Upcoming Events count

**Appointment Statistics:**
- Completed appointments
- Scheduled appointments
- Cancelled appointments
- Weekly and monthly appointment counts

**Quick Actions:**
- Direct links to User Management, Appointments, Scheduling, and Events

### 2. User Management (`/admin/users`)

**Features:**
- View all users (Patients, Providers, Admins)
- Search by name or email
- Filter by role
- Create new users
- Edit user details and roles
- Delete users (with protection against self-deletion)

**User Roles:**
- `patient` - Regular patient users
- `provider` - Healthcare providers
- `admin` - System administrators

### 3. Appointment Management (`/admin/appointments`)

**Features:**
- View all appointments across the system
- Filter by status, date range, provider, facility
- Update appointment status (Scheduled, Completed, Cancelled)
- View patient and provider details
- See facility information

### 4. Scheduling Management (`/admin/scheduling`)

**Features:**
- Select provider to view their schedule
- Calendar view for provider availability
- Block time slots for maintenance or provider leave
- Manage provider schedules facility-wide

### 5. Events & Content Management (`/admin/events`)

**Features:**
- Create, edit, and delete health events
- Event types: Classes, Screenings, Webinars
- Set event dates, times, locations
- Configure online event links
- Set capacity limits

### 6. Facility Management (`/admin/facilities`)

**Features:**
- View all medical facilities
- Add new facilities
- Edit facility information (name, address, phone, hours)
- Set geographic coordinates for map integration
- Delete facilities

### 7. Settings (`/admin/settings`)

**Features:**
- Security settings
- Notification configuration
- Database management
- System configuration

## Backend API Endpoints

All admin endpoints are prefixed with `/api/admin` and require admin authentication.

### Dashboard
- `GET /api/admin/dashboard/stats` - Get system statistics

### User Management
- `GET /api/admin/users` - Get all users (with filters)
- `GET /api/admin/users/:id` - Get user by ID
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Appointment Management
- `GET /api/admin/appointments` - Get all appointments (with filters)
- `PUT /api/admin/appointments/:id` - Update appointment status

### Provider Management
- `GET /api/admin/providers` - Get all providers
- `POST /api/admin/providers` - Create provider

### Facility Management
- `GET /api/admin/facilities` - Get all facilities
- `POST /api/admin/facilities` - Create facility

### Event Management
- `GET /api/admin/events` - Get all events
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/:id` - Update event
- `DELETE /api/admin/events/:id` - Delete event

## Security

### Authentication & Authorization

1. **Admin Middleware** (`backend/middlewares/adminAuth.middleware.js`)
   - Verifies JWT token
   - Checks user role is 'admin'
   - Returns 403 if user is not admin

2. **Route Protection**
   - All `/api/admin/*` routes use `adminAuth` middleware
   - Non-admin users receive 403 Forbidden error

3. **Self-Protection**
   - Admins cannot delete their own accounts
   - Prevents accidental lockout

## File Structure

### Backend
```
backend/
├── middlewares/
│   └── adminAuth.middleware.js    # Admin role verification
├── routes/
│   └── admin.routes.js            # Admin API routes
├── controllers/
│   └── admin.controller.js        # Admin business logic
└── repositories/
    └── admin.repository.js        # Admin data access
```

### Frontend
```
frontend/
├── components/admin/
│   └── AdminLayout.js             # Admin sidebar layout
└── app/admin/
    ├── dashboard/
    │   └── page.js                # Admin dashboard
    ├── users/
    │   └── page.js                # User management
    ├── appointments/
    │   └── page.js                # Appointment management
    ├── scheduling/
    │   └── page.js                # Schedule management
    ├── events/
    │   └── page.js                # Events management
    ├── facilities/
    │   └── page.js                # Facility management
    └── settings/
        └── page.js                # System settings
```

## Creating an Admin User

To create an admin user, you can:

1. **Via Database:**
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   ```

2. **Via API (if you have admin access):**
   ```javascript
   POST /api/admin/users
   {
     "email": "admin@example.com",
     "password": "securepassword",
     "first_name": "Admin",
     "last_name": "User",
     "role": "admin"
   }
   ```

3. **Via Registration then Update:**
   - Register normally (creates as 'patient')
   - Update role to 'admin' via database or admin panel

## Design Consistency

The Admin Portal maintains the same design system as the patient portal:
- **Colors:** Primary (Deep Navy), Secondary (Sky Blue), Accent (Coral)
- **Typography:** Inter, Lato, Montserrat fonts
- **Components:** Card-based layouts, consistent buttons and inputs
- **Responsive:** Mobile-friendly with sidebar navigation

## Future Enhancements

- Advanced calendar view with drag-and-drop scheduling
- Bulk operations for users and appointments
- Audit logs for admin actions
- Email notifications for system events
- Advanced reporting and analytics
- Provider availability templates
- Automated appointment reminders
- Integration with external systems

## Troubleshooting

### Cannot Access Admin Portal

1. **Check User Role:**
   - Verify user has `role: 'admin'` in database
   - Check JWT token contains admin role

2. **Check Authentication:**
   - Ensure you're logged in
   - Token should be valid and not expired

3. **Check Routes:**
   - Backend server should be running
   - Admin routes should be registered in `server.js`

### API Errors

- **403 Forbidden:** User is not an admin
- **401 Unauthorized:** Token missing or invalid
- **500 Internal Server Error:** Check backend logs for details

## Support

For issues or questions about the Admin Portal, refer to the main README.md or check the backend logs for detailed error messages.

