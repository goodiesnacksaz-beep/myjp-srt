# Japanese Subtitle Quiz Application

A Next.js application that allows users to upload Japanese subtitle files (.srt format) and automatically generates vocabulary quizzes from the content.

## Features

- **User Authentication**: Secure sign-up and login with NextAuth.js
- **SRT File Upload**: Drag-and-drop support for subtitle files
- **Automatic Vocabulary Extraction**: Uses kuromoji.js for Japanese tokenization
- **Multiple Quiz Types**:
  - Recognition: Kanji → Reading
  - Meaning: Word → English translation
  - Context: Fill-in-the-blank from subtitle sentences
  - Reverse: English → Japanese word
- **User Dashboard**: Track progress, view statistics, and manage files
- **Spaced Repetition**: Quiz item tracking for better learning

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Japanese Processing**: kuromoji.js
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or hosted - see Supabase guide below)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd next-app-jp
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

**Option A: Local PostgreSQL**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/japanese_quiz_db?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/japanese_quiz_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# API Keys (Optional)
JISHO_API_URL="https://jisho.org/api/v1/search/words"
```

**Option B: Supabase (Recommended)**

See **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** for complete Supabase setup instructions.

```env
# Supabase Database (with connection pooling)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate a secret key for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Install missing dependencies

```bash
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs --legacy-peer-deps
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(auth)
    /login              - Login page
    /signup             - Sign up page
  /dashboard            - User dashboard
  /upload               - File upload page
  /files/[id]           - File details and vocabulary list
  /quiz/[fileId]        - Quiz interface
  /api
    /auth               - NextAuth API routes
    /upload             - File upload handler
    /files              - File management
    /quiz               - Quiz generation and submission
    /dashboard          - Dashboard statistics
/components
  FileUpload.tsx        - Drag-and-drop upload component
  Navbar.tsx            - Navigation bar
  SessionProvider.tsx   - NextAuth session provider
/lib
  db.ts                 - Prisma client
  auth.ts               - NextAuth configuration
  srt-parser.ts         - SRT file parser
  japanese-processor.ts - Japanese tokenization
  vocabulary-extractor.ts - Vocabulary extraction engine
  quiz-generator.ts     - Quiz generation logic
/types
  index.ts              - TypeScript type definitions
  next-auth.d.ts        - NextAuth type extensions
```

## Testing

### Quick Test
Visit `/test` page to test SRT parsing: http://localhost:3000/test

Upload `test-srt/aot1.srt` or `sample-subtitle.srt` to verify parsing works.

See **[QUICK_TEST.md](QUICK_TEST.md)** for rapid testing instructions.  
See **[TESTING_GUIDE.md](TESTING_GUIDE.md)** for comprehensive testing guide.

## Usage

1. **Create an account**: Sign up with email and password
2. **Upload a subtitle file**: Go to Upload page and drop a .srt file
3. **Wait for processing**: Vocabulary extraction happens automatically (1-2 minutes)
4. **View vocabulary**: Check the file details page to see extracted words
5. **Take a quiz**: Start a quiz with your preferred settings
6. **Track progress**: View statistics and history on the dashboard

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/upload` - Upload SRT file
- `GET /api/files` - List user's files
- `GET /api/files/[id]` - Get file details
- `DELETE /api/files/[id]` - Delete file
- `POST /api/quiz/generate` - Generate quiz
- `POST /api/quiz/submit` - Submit quiz results
- `GET /api/dashboard/stats` - Get user statistics

## Database Schema

The application uses the following main models:
- **User**: User accounts and authentication
- **SubtitleFile**: Uploaded subtitle files
- **Vocabulary**: Extracted vocabulary words
- **QuizAttempt**: Quiz history and scores
- **QuizItem**: Individual word practice statistics

## Features to Add

- [ ] Dark mode toggle
- [ ] Export vocabulary to Anki
- [ ] Audio pronunciation
- [ ] Detailed progress charts
- [ ] Social features (share quizzes)
- [ ] Mobile app version

## Deployment

### Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel project settings:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`

## Troubleshooting

### Kuromoji dictionary not found
Make sure kuromoji's dictionary is accessible. The dictionary is included in the node_modules.

### Database connection issues
Verify your `DATABASE_URL` is correct and PostgreSQL is running.

### Upload fails
Check file size (max 5MB) and format (.srt only).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

