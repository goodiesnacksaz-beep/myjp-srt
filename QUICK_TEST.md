# ⚡ Quick Test Instructions

## Setup (One Time)

```bash
# 1. Install dependencies
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs ts-node jmdict-simplified-node --legacy-peer-deps

# 2. Setup database (make sure .env is configured)
npx prisma generate
npx prisma db push
npm run db:seed

# 3. Start server
npm run dev
```

## Test the SRT Parser (Quick)

1. Open: http://localhost:3000/test
2. Upload: `test-srt/aot1.srt`
3. Verify it parses correctly ✅

## Test Full Workflow

1. **Login**: http://localhost:3000/login
   - Email: `test@example.com`
   - Password: `password123`

2. **Upload File**: http://localhost:3000/upload
   - Upload `test-srt/aot1.srt`
   - Wait for success message

3. **Watch Console**: Terminal should show:
   ```
   Starting vocabulary extraction...
   Kuromoji tokenizer initialized successfully
   Processing 620 subtitle entries...
   ...
   Vocabulary extraction complete: XX words
   ```

4. **Check Dashboard**: http://localhost:3000/dashboard
   - File should appear in list
   - Wait 1-2 minutes for processing

5. **View Vocabulary**: Click on file name
   - Should see extracted words with readings and meanings

6. **Take Quiz**: Click "Quiz" button
   - Select quiz type and count
   - Answer questions
   - View results ✅

## Expected Timeline

- File upload: **Instant**
- Vocabulary extraction: **1-2 minutes**
- Quiz generation: **Instant**

## Common Issues

### ❌ "Cannot connect to database"
```bash
# Check .env file has DATABASE_URL
cat .env | grep DATABASE_URL

# Test connection
npx prisma studio
```

### ❌ "Kuromoji error"
```bash
# Reinstall kuromoji
npm install kuromoji --legacy-peer-deps
```

### ❌ "No vocabulary appears"
- Wait 2 minutes
- Refresh the page
- Check terminal console for errors

## Quick Debug Commands

```bash
# View database
npx prisma studio

# Check logs
# (in terminal where npm run dev is running)

# Restart server
# Ctrl+C then npm run dev
```

## Success Checklist

- [ ] Test page shows parsed SRT ✅
- [ ] Can login
- [ ] File uploads successfully
- [ ] Console shows processing logs
- [ ] Vocabulary appears (after 1-2 min)
- [ ] Quiz works
- [ ] Results save

## 🎉 All Working?

You're ready to use the app! Try uploading your own Japanese subtitle files.

## 🆘 Problems?

See **TESTING_GUIDE.md** for detailed troubleshooting.

