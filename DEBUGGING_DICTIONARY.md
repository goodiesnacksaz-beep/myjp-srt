# 🔍 Debugging Dictionary Lookups

## Changes Made

### 1. Added Detailed Logging
Every dictionary lookup now shows:
- 📦 **Cache hit**: Word found in memory (instant)
- 🔍 **Looking up**: Querying Jisho API
- ✅ **Found**: Successful lookup with meaning
- ❌ **Not found**: No results from API
- ⚠️ **Warning**: Unusual response structure

### 2. Increased Delays
- Timeout: 5s → 10s (more time for API response)
- Rate limit: 100ms → 200ms (more respectful to API)

### 3. Better Error Messages
Shows specific error codes (403, 429, 500, etc.)

## How to Debug

### Step 1: Upload with Logging

```bash
# Restart server
npm run dev

# Upload file and watch console
```

### Step 2: Check Console Output

**Good Example:**
```
✅ Dictionary initialized - using Jisho API with caching
Looking up meanings for 100 words using Jisho API...
Looked up 0/100 meanings...
🔍 Looking up "人類" via API...
✅ Found "人類": mankind, humanity
🔍 Looking up "思い出す" via API...
✅ Found "思い出す": to recall, to remember
```

**Problem Example (Rate Limit):**
```
🔍 Looking up "人" via API...
❌ API error for "人": 429 - Too Many Requests
```

**Problem Example (Timeout):**
```
🔍 Looking up "人" via API...
❌ API error for "人": unknown - timeout of 10000ms exceeded
```

## Common Issues & Fixes

### Issue 1: Rate Limiting (429 Error)

**Symptoms:**
```
❌ API error for "人": 429 - Too Many Requests
```

**Why:** Too many requests to Jisho API too quickly

**Fix 1:** Increase delay even more
```typescript
// In lib/vocabulary-extractor.ts, change:
await this.sleep(200); 
// to:
await this.sleep(500); // Half a second between calls
```

**Fix 2:** Reduce word count
```typescript
// In lib/vocabulary-extractor.ts, change:
const wordsToProcess = frequentWords.slice(0, 100);
// to:
const wordsToProcess = frequentWords.slice(0, 50); // Only top 50 words
```

### Issue 2: Timeout

**Symptoms:**
```
❌ API error for "人": unknown - timeout of 10000ms exceeded
```

**Why:** Network is slow or API is down

**Fix:** The timeout is already 10 seconds. Check your internet connection.

### Issue 3: Empty Response

**Symptoms:**
```
⚠️ No results from API for "人"
❌ No meaning found for "人"
```

**Why:** API returned empty data (rare for common words)

**Fix:** This shouldn't happen for common words like 人. If it does, check:
```bash
# Test API directly:
curl "https://jisho.org/api/v1/search/words?keyword=%E4%BA%BA"
```

### Issue 4: Network Error

**Symptoms:**
```
❌ API error for "人": unknown - Network Error
```

**Why:** No internet or firewall blocking

**Fix:** Check internet connection, firewall, or proxy settings

## Manual Test

Test a specific word manually:

```javascript
// Create test-word.js:
const axios = require('axios');

axios.get('https://jisho.org/api/v1/search/words?keyword=%E4%BA%BA', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
  }
}).then(r => {
  console.log('Status:', r.status);
  console.log('Results:', r.data.data.length);
  console.log('First meaning:', r.data.data[0].senses[0].english_definitions.join(', '));
}).catch(e => {
  console.log('Error:', e.message);
});
```

```bash
node test-word.js
```

Expected output:
```
Status: 200
Results: 10
First meaning: person, someone, somebody
```

## What to Share

If the problem persists, share:

1. **Console output** during upload (especially the 🔍 and ❌ lines)
2. **Specific words** that failed
3. **Error codes** (403, 429, 500, etc.)
4. **Network test** result (curl or test-word.js)

## Quick Fixes to Try Now

### Fix 1: Slower Rate Limit
Already applied! Now 200ms between calls.

### Fix 2: Smaller Batches
```typescript
// In lib/vocabulary-extractor.ts
const wordsToProcess = frequentWords.slice(0, 30); // Start with just 30 words
```

### Fix 3: Retry Logic

Add retry for failed words:
```typescript
// In dictionary.ts lookup method
let retries = 3;
while (retries > 0) {
  const meaning = await this.lookupViaAPI(word);
  if (meaning) return meaning;
  retries--;
  await new Promise(r => setTimeout(r, 1000)); // Wait 1 second before retry
}
```

## Next Steps

1. **Upload again** with new logging
2. **Watch console** for specific errors
3. **Share the logs** if problems persist
4. **Try manual test** to isolate API vs. code issue

The detailed logging will tell us exactly where the problem is! 🔍

