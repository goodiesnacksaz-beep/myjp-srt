# 🔍 Debugging Upload Error

## Common Causes & Solutions

### 1. Check Server Console Logs

Look at your terminal where `npm run dev` is running. The error details will be there.

Common errors you might see:

#### A. "Cannot find module 'bcryptjs'"
```bash
# Solution:
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs --legacy-peer-deps
```

#### B. "PrismaClient is not configured"
```bash
# Solution:
npx prisma generate
npx prisma db push
```

#### C. "Unauthorized" or session issues
- Make sure you're logged in
- Try logging out and back in

#### D. "Cannot find module 'jmdict-simplified-node'"
```bash
# Solution:
npm install jmdict-simplified-node --legacy-peer-deps
```

### 2. Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Share what you see

### 3. Verify Authentication

```bash
# Check if you're logged in:
# - Should see your email in the navbar
# - If not, go to /login
```

### 4. Check Database Connection

```bash
# Test database:
npx prisma studio

# If this fails, your database isn't connected
# Fix your .env DATABASE_URL
```

### 5. Check File Format

- File must end with `.srt`
- File must be under 5MB
- File must contain Japanese text

## Quick Debug Steps

```bash
# 1. Stop the server (Ctrl+C)

# 2. Install all dependencies
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs ts-node jmdict-simplified-node --legacy-peer-deps

# 3. Generate Prisma
npx prisma generate

# 4. Restart server
npm run dev

# 5. Try upload again
```

## Get Detailed Error

Let me help you see the actual error. Check:

1. **Terminal console** (where npm run dev is running)
2. **Browser console** (F12 → Console tab)
3. **Network tab** (F12 → Network → Look for failed upload request → Response)

## Most Likely Issues

Based on recent changes:

### Issue 1: JMdict Not Found
```
Error: Cannot find module 'jmdict-simplified-node'
```

**Fix:**
```bash
npm install jmdict-simplified-node --legacy-peer-deps
```

### Issue 2: Not Logged In
```
Error: Unauthorized (401)
```

**Fix:**
- Go to http://localhost:3000/login
- Login with test account or create new one

### Issue 3: Database Not Set Up
```
Error: PrismaClient initialization failed
```

**Fix:**
```bash
npx prisma generate
npx prisma db push
```

### Issue 4: bcryptjs Missing
```
Error: Cannot find module 'bcryptjs'
```

**Fix:**
```bash
npm install bcryptjs @types/bcryptjs --legacy-peer-deps
```

## Share Error Details

To help you better, please share:

1. Error from terminal (where npm run dev runs)
2. Error from browser console (F12)
3. Response from Network tab

## Quick Checklist

- [ ] Server is running (`npm run dev`)
- [ ] You're logged in (see email in navbar)
- [ ] Database is set up (`npx prisma studio` works)
- [ ] All dependencies installed (see command above)
- [ ] File is .srt format
- [ ] File is under 5MB

## Emergency Reset

If nothing works:

```bash
# Stop server
Ctrl+C

# Clean install
rm -rf node_modules
npm install
npm install bcryptjs @next-auth/prisma-adapter @types/bcryptjs ts-node jmdict-simplified-node --legacy-peer-deps

# Setup database
npx prisma generate
npx prisma db push

# Restart
npm run dev
```

---

**Share the actual error message from your console and I can provide a specific fix!**

