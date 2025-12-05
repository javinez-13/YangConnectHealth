# Interactive Healthcare Website

A modern, full-stack healthcare portal built with Next.js (frontend) and Express.js (backend), featuring appointment booking, care team management, health events, and more.

## Features

### Public Pages
- **Homepage**: Hero section, doctor search, testimonials, and key features
- **Services**: Comprehensive list of medical services
- **About Us**: Mission, vision, leadership team, and facility information

### Secure Portal (Post-Login)
- **Dashboard**: Personalized hub with next appointment, quick actions, vitals snapshot, and alerts
- **Schedule**: Intuitive appointment booking with provider search, calendar view, and multi-step booking flow
- **My Appointments**: View upcoming and past appointments with reschedule/cancel options
- **Care Team**: Connect with providers, view facilities, and manage insurance information
- **Events**: Browse and register for health classes, screenings, and webinars

## Tech Stack

### Frontend
- Next.js 14 (React)
- Tailwind CSS for styling
- Axios for API calls
- date-fns for date formatting
- Lucide React for icons

### Backend
- Node.js with Express.js
- PostgreSQL (Neon Database)
- JWT for authentication
- bcryptjs for password hashing
- speakeasy for 2FA
- express-validator for input validation

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── controllers/             # Request handlers
│   ├── middlewares/             # Auth, validation
│   ├── repositories/            # Data access layer
│   ├── routes/                  # API routes
│   ├── database/
│   │   ├── schema.sql           # Database schema
│   │   └── seed.sql             # Sample data
│   └── server.js                # Express server
├── frontend/
│   ├── app/                     # Next.js app directory
│   │   ├── page.js              # Homepage
│   │   ├── login/               # Login page
│   │   ├── register/           # Registration page
│   │   ├── dashboard/           # Dashboard
│   │   ├── schedule/            # Appointment booking
│   │   ├── appointments/        # Appointment management
│   │   ├── care-team/           # Care team page
│   │   ├── events/              # Health events
│   │   ├── services/            # Services page
│   │   └── about/               # About page
│   ├── components/              # Reusable components
│   └── lib/                     # Utilities (API, auth)
└── package.json                 # Root package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Neon connection string provided)

### Installation

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up the database**
   - The database connection is already configured in `backend/.env`
   - Run the schema and seed files on your PostgreSQL database:
     ```bash
     # Connect to your database and run:
     psql <your-connection-string> < backend/database/schema.sql
     psql <your-connection-string> < backend/database/seed.sql
     ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```
   This will start both backend (port 5000) and frontend (port 3000) concurrently.

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Design System

### Colors
- **Primary**: Deep Navy (#0A4D68)
- **Secondary**: Sky Blue (#5FB3D9) / Mint Green (#A8D5E2)
- **Accent**: Bright Coral (#FF6B6B)
- **Neutral**: Whites and Light Greys

### Typography
- Font families: Inter, Lato, Montserrat
- Clean, legible sans-serif fonts

### Components
- Modern card-based layouts
- Smooth transitions and animations
- Responsive design (mobile-first)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/setup-2fa` - Setup two-factor authentication
- `POST /api/auth/disable-2fa` - Disable 2FA

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments` - Book new appointment
- `GET /api/appointments/slots` - Get available time slots
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Providers
- `GET /api/providers` - Get all providers (with filters)
- `GET /api/providers/:id` - Get provider details
- `GET /api/providers/specialty/:specialty` - Get providers by specialty

### Facilities
- `GET /api/facilities` - Get all facilities
- `GET /api/facilities/patient` - Get patient's facilities
- `GET /api/facilities/:id` - Get facility details

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/register` - Register for event
- `GET /api/events/my-registrations` - Get user's registered events

### Dashboard
- `GET /api/dashboard` - Get dashboard data

## Environment Variables

### Backend (.env)
```
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend
The frontend uses Next.js environment variables. Set `NEXT_PUBLIC_API_URL` if your backend is on a different URL.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Two-factor authentication (2FA) support
- Input validation with express-validator
- CORS configuration
- Secure token storage

## Future Enhancements

- Biometric authentication (Face ID/Fingerprint)
- Real-time notifications
- Video consultation integration
- Health records management
- Prescription management
- Billing and payment integration
- Waiting room queue system
- Pre-visit questionnaires

## License

This project is for educational purposes.

