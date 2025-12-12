# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (already configured with Neon)

## Steps

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Initialize Database
```bash
cd backend
npm run init-db
cd ..
```

### 3. Start the Application
```bash
npm run dev
```

### 4. Open Your Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### 5. Create an Account
1. Go to http://localhost:3000/register
2. Fill in your details
3. Start exploring!

## What's Included

✅ **Public Pages**
- Homepage with hero section
- Services page
- About Us page

✅ **Secure Portal**
- Dashboard with personalized info
- Appointment booking system
- Care team management
- Health events and classes
- Appointment history

✅ **Features**
- User authentication (JWT)
- Two-factor authentication (2FA)
- Real-time appointment scheduling
- Provider search and filtering
- Event registration

## Sample Data

After running `npm run init-db`, you'll have:
- 5 healthcare providers
- 3 medical facilities
- 5 health events

## Need Help?

Check out:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup instructions

## Troubleshooting

**Port already in use?**
- Change `PORT` in `backend/.env` for backend
- Frontend uses port 3000 by default

**Database connection error?**
- Verify `DATABASE_URL` in `backend/.env`
- Ensure your database is accessible

**Module not found?**
- Run `npm run install:all` again
- Delete `node_modules` folders and reinstall

Happy coding! 🚀

