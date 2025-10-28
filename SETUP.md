# Quick Setup Guide

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- PostgreSQL database running
- Git (optional)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Additional Required Packages

```bash
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs ts-node --legacy-peer-deps
```

### 3. Set Up PostgreSQL Database

Create a new database:
```sql
CREATE DATABASE japanese_quiz_db;
```

Or use PostgreSQL command line:
```bash
psql -U postgres
CREATE DATABASE japanese_quiz_db;
\q
```

### 4. Configure Environment Variables

The project already has a `.env` file. Update it with your database credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/japanese_quiz_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key"
```

Generate a secret key:
```bash
openssl rand -base64 32
```

### 5. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data (optional)
npm run db:seed
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Test the Application

### Option 1: Use Seeded Data

If you ran the seed command, you can login with:
- Email: `test@example.com`
- Password: `password123`

### Option 2: Create New Account

1. Click "Sign Up"
2. Fill in your details
3. Login with your credentials

### Upload Sample File

1. Go to Upload page
2. Upload the included `sample-subtitle.srt` file
3. Wait for vocabulary extraction (may take 30-60 seconds)
4. View extracted vocabulary
5. Take a quiz!

## Common Issues

### Issue: "Cannot find module bcryptjs"
**Solution**: Run `npm install bcryptjs @types/bcryptjs --legacy-peer-deps`

### Issue: "Prisma Client not generated"
**Solution**: Run `npx prisma generate`

### Issue: "Cannot connect to database"
**Solution**: 
- Make sure PostgreSQL is running
- Verify DATABASE_URL in .env
- Check username and password

### Issue: "Kuromoji dictionary not found"
**Solution**: The dictionary is in node_modules/kuromoji/dict. Make sure kuromoji is installed.

### Issue: Vocabulary extraction is slow
**Solution**: This is normal for the first run. The Jisho API has rate limits. For production, consider:
- Using a local dictionary (JMdict)
- Caching translations
- Background job queue

## Production Deployment

### Vercel

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

Required environment variables:
- `DATABASE_URL` (use a hosted PostgreSQL like Supabase or Neon)
- `NEXTAUTH_URL` (your production domain)
- `NEXTAUTH_SECRET`

### Database Providers

Recommended PostgreSQL hosting:
- [Supabase](https://supabase.com) - Free tier available
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Easy deployment
- [Render](https://render.com) - Free PostgreSQL

## Next Steps

1. **Customize**: Modify the UI and features to your needs
2. **Optimize**: Add caching for Jisho API calls
3. **Enhance**: Implement more quiz types
4. **Extend**: Add export to Anki, audio playback, etc.

## Support

For issues, check:
- README.md for detailed documentation
- Prisma logs: `npx prisma studio` to view database
- Browser console for client errors
- Terminal for server errors

Happy learning! 🎌📚

