# 🚀 Setting Up with Supabase

This guide will walk you through setting up the Japanese Subtitle Quiz App with Supabase as your database provider.

## Why Supabase?

- ✅ Free tier with 500MB database
- ✅ Hosted PostgreSQL (no local setup needed)
- ✅ Automatic backups
- ✅ Built-in authentication (optional alternative to NextAuth)
- ✅ Real-time capabilities
- ✅ Easy to scale

## Step-by-Step Setup

### 1. Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

### 2. Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `japanese-quiz-app` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users
   - **Pricing Plan**: Free tier is perfect to start

3. Click "Create new project"
4. Wait 2-3 minutes for your database to be provisioned

### 3. Get Your Database Connection String

1. In your Supabase dashboard, click on your project
2. Go to **Settings** (gear icon in sidebar)
3. Click **Database** in the left menu
4. Scroll down to **Connection string**
5. Select **URI** tab (not Session mode)
6. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 4. Update Your .env File

Replace `[YOUR-PASSWORD]` with the database password you created:

```env
# Supabase Database URL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"

# For Prisma migrations, use direct connection (without pgbouncer)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"

# API
JISHO_API_URL="https://jisho.org/api/v1/search/words"
```

**Important Notes:**
- Replace `[YOUR-PASSWORD]` with your actual password
- Replace `[PROJECT-REF]` with your project reference (visible in the URL)
- The `?pgbouncer=true` is important for connection pooling
- Keep `DIRECT_URL` without `?pgbouncer=true` for migrations

### 5. Update Prisma Schema

Update your `prisma/schema.prisma` to support both URLs:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

This is already configured in your schema, so you should be good to go!

### 6. Install Dependencies

```bash
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs ts-node --legacy-peer-deps
```

### 7. Initialize Your Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Optional: Seed with sample data
npm run db:seed
```

### 8. Verify Connection

You can verify the connection worked by:

**Option A: Using Prisma Studio**
```bash
npx prisma studio
```
This will open a GUI at http://localhost:5555

**Option B: Check Supabase Dashboard**
1. Go to your Supabase project
2. Click **Table Editor** in the sidebar
3. You should see your tables: User, Account, Session, SubtitleFile, Vocabulary, QuizAttempt, QuizItem

### 9. Run Your App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🔒 Security Best Practices

### Use Environment Variables

Never commit your `.env` file! It's already in `.gitignore`.

### Connection Pooling

Supabase includes PgBouncer for connection pooling. The `?pgbouncer=true` parameter enables this, which is important for:
- Serverless functions (like Vercel)
- Preventing "too many connections" errors

### RLS (Row Level Security) - Optional

Supabase supports Row Level Security. While we're using NextAuth for auth, you could add an extra layer:

1. Go to **Authentication** > **Policies** in Supabase
2. Enable RLS on your tables
3. Create policies for your tables

For this app, NextAuth handles authorization, so RLS is optional.

## 🚀 Deploying to Production

### Vercel + Supabase

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL` (from Supabase)
     - `DIRECT_URL` (from Supabase)
     - `NEXTAUTH_URL` (your production domain)
     - `NEXTAUTH_SECRET` (same as local)

3. **Deploy!**
   - Vercel will automatically build and deploy
   - Prisma migrations run during build

## 📊 Monitoring Your Database

### Supabase Dashboard

Monitor your database usage:
1. **Database** tab - See storage, connections
2. **Table Editor** - View and edit data
3. **SQL Editor** - Run custom queries
4. **Logs** - View database logs

### Usage Limits (Free Tier)

- 500 MB database space
- 5 GB bandwidth per month
- 2 GB file storage
- 50,000 monthly active users

This is more than enough to start!

## 🔧 Troubleshooting

### "Connection refused" or "timeout"

**Solution**: Check your connection string
- Verify password is correct
- Ensure project is not paused (Supabase pauses inactive projects)
- Check your IP isn't blocked

### "Too many connections"

**Solution**: Make sure you're using the pooled connection
- Use `?pgbouncer=true` in DATABASE_URL
- Use DIRECT_URL only for migrations

### "SSL connection required"

**Solution**: Add SSL mode to connection string
```env
DATABASE_URL="postgresql://...?pgbouncer=true&sslmode=require"
```

### Project Paused

Supabase pauses projects after 1 week of inactivity on free tier.
- Just visit your dashboard to wake it up
- Or upgrade to Pro tier ($25/month)

## 🎯 Next Steps

### Optimize for Production

1. **Connection Pooling**: Already configured with pgbouncer
2. **Indexes**: Prisma creates basic indexes, add custom ones in SQL Editor if needed
3. **Backups**: Supabase auto-backs up daily on free tier

### Optional Supabase Features

1. **Supabase Auth**: Could replace NextAuth
2. **Storage**: For user profile images
3. **Realtime**: For live quiz competitions
4. **Edge Functions**: For serverless processing

### Monitor Performance

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

Run this in Supabase SQL Editor to monitor growth.

## 💡 Pro Tips

1. **Bookmark your Supabase dashboard** - You'll use it often
2. **Enable email notifications** - Get alerts for issues
3. **Use SQL Editor** - Great for quick data checks
4. **Download backups** - Before major changes
5. **Monitor usage** - Stay within free tier limits

## 🆘 Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Supabase Discord](https://discord.supabase.com)

## ✅ Checklist

Before you start development:

- [ ] Supabase account created
- [ ] New project created
- [ ] Database password saved securely
- [ ] Connection strings copied to `.env`
- [ ] Dependencies installed
- [ ] `npx prisma generate` completed
- [ ] `npx prisma db push` successful
- [ ] Tables visible in Supabase dashboard
- [ ] Sample data seeded (optional)
- [ ] App running locally
- [ ] Test account created

You're all set! 🎌

---

## Quick Reference

```bash
# Complete setup in 5 commands
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs ts-node --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run db:seed  # optional
npm run dev
```

Happy coding! 頑張ってください！

