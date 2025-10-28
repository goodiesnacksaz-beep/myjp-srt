# 🚀 Getting Started

## Welcome to Your Japanese Subtitle Quiz App!

The project has been successfully created. Follow these steps to get it running.

## 📋 Prerequisites

Make sure you have:
- ✅ Node.js 18 or higher
- ✅ PostgreSQL database
- ✅ npm or yarn

## ⚡ Quick Start (5 minutes)

### Step 1: Install Required Dependencies

```bash
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs ts-node jmdict-simplified-node --legacy-peer-deps
```

### Step 2: Set Up Your Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb japanese_quiz_db
```

**Option B: Use a Cloud Database** (Recommended)
- [Supabase](https://supabase.com) - **See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for complete guide**
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Full-stack platform

### Step 3: Configure Environment

Update the `.env` file with your database URL:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/japanese_quiz_db"
```

Generate a secret for NextAuth:
```bash
openssl rand -base64 32
```

Add it to `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

### Step 4: Initialize the Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Add sample data
npm run db:seed
```

### Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🧪 Testing the App

### Option 1: Use Sample Data

If you ran the seed command:
- Email: `test@example.com`
- Password: `password123`

### Option 2: Create New Account

1. Click "Sign Up"
2. Enter your details
3. Login

### Try Uploading a File

1. Navigate to "Upload" page
2. Upload the `sample-subtitle.srt` file
3. Wait 30-60 seconds for processing
4. View vocabulary and take a quiz!

## 📚 What You Can Do

### Upload Japanese Subtitles
- Drag and drop .srt files
- Maximum 5MB per file
- Automatic vocabulary extraction

### Learn Vocabulary
- View extracted words with readings
- See context sentences
- Check frequency counts

### Take Quizzes
- Recognition (Kanji → Reading)
- Meaning (Word → English)
- Context (Fill in the blank)
- Reverse (English → Japanese)

### Track Progress
- View statistics
- See quiz history
- Manage your files

## 🔧 Troubleshooting

### "Cannot find module bcryptjs"
```bash
npm install bcryptjs @types/bcryptjs --legacy-peer-deps
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Database connection error"
- Check PostgreSQL is running: `pg_isready`
- Verify `.env` DATABASE_URL
- Test connection: `npx prisma studio`

### "Port 3000 already in use"
```bash
# Use a different port
PORT=3001 npm run dev
```

## 📖 Documentation

- **README.md** - Full documentation
- **SETUP.md** - Detailed setup guide
- **PROJECT_SUMMARY.md** - Project overview
- **project-overview.txt** - Original specifications

## 🎯 Next Steps

1. **Customize the UI** - Modify colors, fonts, layouts
2. **Add features** - Export to Anki, audio playback, etc.
3. **Deploy** - Push to Vercel, Railway, or your preferred platform
4. **Share** - Let others learn Japanese with your app!

## 🚀 Deploying to Production

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy!

Environment variables needed:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`

### Other Platforms

- **Railway** - Auto-deploys from Git
- **Render** - Free tier available
- **Fly.io** - Global deployment

## 💡 Tips

- **Start small**: Upload a short subtitle file first
- **Be patient**: First vocabulary extraction takes time
- **Use seed data**: Great for testing features
- **Check logs**: Terminal shows processing status
- **Prisma Studio**: Use `npx prisma studio` to view database

## 🆘 Need Help?

- Check the README.md for detailed docs
- Review the code comments
- Check Prisma logs: `npx prisma studio`
- Browser console for client errors
- Terminal for server errors

## 🎌 Happy Learning!

You're all set! Start uploading Japanese subtitles and improve your vocabulary.

頑張ってください！(Good luck!)

