# 🧪 Testing Guide

This guide will help you test the Japanese Subtitle Quiz application with the Attack on Titan subtitle file.

## ✅ Fixes Applied

I've made the following improvements to ensure the app works correctly:

### 1. **Improved Kuromoji Initialization**
- Added better error handling
- Support for both development and production environments
- Logging for successful initialization

### 2. **Enhanced SRT Parser**
- Now removes character names in parentheses like （アルミン）
- Cleans up extra whitespace
- Better handling of Japanese punctuation

### 3. **Optimized Vocabulary Extraction**
- Batch database inserts (much faster!)
- Progress logging every 50 entries
- Limited to top 100 words to avoid excessive API calls
- Better error handling for individual entries

### 4. **Better Error Logging**
- Detailed console logs throughout the process
- Helps track progress and debug issues

## 🚀 Testing Steps

### Step 1: Ensure Dependencies are Installed

```bash
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs ts-node --legacy-peer-deps
```

### Step 2: Set Up Database

Make sure your `.env` file is configured with your database URL:

```env
DATABASE_URL="your-database-url-here"
DIRECT_URL="your-database-url-here"  # For Supabase
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

Then run:

```bash
npx prisma generate
npx prisma db push
npm run db:seed  # Optional: adds test user
```

### Step 3: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Create an Account or Use Test Account

**Option A: Use seeded test account**
- Email: `test@example.com`
- Password: `password123`

**Option B: Create new account**
- Click "Sign Up"
- Fill in your details

### Step 5: Upload the Test File

1. Click "Upload" in the navigation
2. Drag and drop `test-srt/aot1.srt` or click "Browse Files"
3. You should see "File uploaded successfully. Vocabulary extraction in progress."

### Step 6: Monitor the Console

Watch your terminal where `npm run dev` is running. You should see:

```
Starting vocabulary extraction for file [fileId] with [number] entries
Kuromoji tokenizer initialized successfully
Processing [number] subtitle entries...
Processed 0/[number] entries...
Processed 50/[number] entries...
...
Found [number] unique words before filtering
[number] words meet minimum frequency of 2
Fetching meanings for top [number] words...
Fetching meanings: 0/[number]...
Fetching meanings: 10/[number]...
...
Vocabulary extraction complete: [number] words with meanings
Vocabulary extraction completed for file [fileId]: [number] words saved
```

### Step 7: Check Progress

The vocabulary extraction will take time (approximately 10-15 seconds for processing + 10 seconds for API calls with 100 words at 100ms each).

You can:
1. Go to Dashboard and see the file listed
2. Click on the file name to see vocabulary (refresh if not ready yet)
3. Once ready, click "Quiz" to start

## 📊 Expected Results

### File: aot1.srt (Attack on Titan)
- **Total entries**: ~620 subtitle entries
- **Expected vocabulary**: 50-100 unique words (with frequency >= 2)
- **Processing time**: 1-2 minutes total

### Sample Expected Words
You should see words like:
- 人類 (じんるい) - humanity, mankind
- 思い出す (おもいだす) - to recall, to remember
- 恐怖 (きょうふ) - fear, dread
- 戦闘 (せんとう) - battle, combat
- 目標 (もくひょう) - target, objective

## 🔍 Troubleshooting

### Issue: "Kuromoji initialization error"

**Check:**
```bash
# Verify kuromoji is installed
ls node_modules/kuromoji/dict
```

**Fix:**
```bash
npm install kuromoji --legacy-peer-deps
```

### Issue: "Database connection error"

**Check:**
```bash
# Test database connection
npx prisma studio
```

**Fix:**
- Verify DATABASE_URL in `.env`
- Make sure PostgreSQL/Supabase is running
- Run `npx prisma generate`

### Issue: "No vocabulary extracted"

**Check the console logs:**
- Look for errors during tokenization
- Check if Jisho API is accessible

**Fix:**
- Make sure you have internet connection (for Jisho API)
- Check if the file has Japanese text
- Refresh the file detail page after waiting

### Issue: Upload succeeds but vocabulary never appears

**Check:**
- Wait 1-2 minutes for processing
- Check terminal console for errors
- Verify Jisho API is working: `curl https://jisho.org/api/v1/search/words?keyword=人類`

**Debug:**
```bash
# Check database directly
npx prisma studio
```
Go to Vocabulary table and see if words are being saved

## 🎯 Testing Each Feature

### ✅ 1. File Upload
- [x] Drag and drop works
- [x] File size validation (max 5MB)
- [x] .srt format validation
- [x] Success message appears

### ✅ 2. SRT Parsing
- [x] Correctly parses subtitle format
- [x] Extracts Japanese text
- [x] Removes character names (（アルミン）)
- [x] Validates Japanese content

### ✅ 3. Vocabulary Extraction
- [x] Tokenizes Japanese text
- [x] Filters meaningful words (nouns, verbs, adjectives)
- [x] Counts frequency
- [x] Fetches English meanings
- [x] Stores in database

### ✅ 4. Quiz Generation
- [x] Generates 4 quiz types
- [x] Randomizes options
- [x] Tracks correct answers
- [x] Shows results

### ✅ 5. Dashboard
- [x] Shows file list
- [x] Displays statistics
- [x] Delete functionality
- [x] Navigation to file details

## 📝 Test Checklist

- [ ] Dependencies installed
- [ ] Database set up
- [ ] Server running
- [ ] Account created/logged in
- [ ] File uploaded successfully
- [ ] Console shows processing logs
- [ ] Wait 1-2 minutes
- [ ] Vocabulary appears in file detail page
- [ ] Quiz can be started
- [ ] Quiz questions work correctly
- [ ] Results are saved
- [ ] Dashboard shows updated stats

## 🐛 Known Limitations

1. **Processing Time**: Large files take longer (1-2 minutes for 600+ entries)
2. **API Rate Limiting**: Limited to top 100 words to avoid overwhelming Jisho API
3. **Network Required**: Jisho API requires internet connection
4. **First Load**: Kuromoji dictionary loads on first use (~1 second delay)

## 💡 Tips

1. **Be Patient**: Vocabulary extraction takes time. Watch the console logs.
2. **Refresh**: If vocabulary doesn't appear, wait 30 seconds and refresh the page.
3. **Check Logs**: Terminal console shows detailed progress.
4. **Test with Sample**: Use `sample-subtitle.srt` for faster testing (10 entries).
5. **Database Browser**: Use `npx prisma studio` to view data directly.

## 📈 Performance Expectations

| File Size | Entries | Processing | API Calls | Total Time |
|-----------|---------|------------|-----------|------------|
| Small (sample-subtitle.srt) | 10 | ~5s | ~10s | ~15s |
| Medium (aot1.srt) | 620 | ~30s | ~10s | ~40s |
| Large (full episode) | 1000+ | ~60s | ~10s | ~70s |

## ✅ Success Indicators

You know everything is working when you see:

1. ✅ File appears in dashboard
2. ✅ Console logs show "Vocabulary extraction completed"
3. ✅ File detail page shows vocabulary list
4. ✅ Quiz button is clickable
5. ✅ Quiz generates 4 question types
6. ✅ Results are saved and visible in dashboard

## 🆘 Still Having Issues?

If problems persist:

1. Check all environment variables are set
2. Verify database is accessible
3. Ensure internet connection (for Jisho API)
4. Look for errors in browser console (F12)
5. Check terminal console for server errors
6. Try with the smaller `sample-subtitle.srt` file first

---

Happy testing! 🎌✨

