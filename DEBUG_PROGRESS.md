# 🔍 Progress Bar Debugging Guide

## What I've Added

I've added extensive logging throughout the entire progress tracking system to help diagnose why the progress bar isn't updating.

## How to Test

1. **Open your browser console** (F12 → Console tab)
2. **Upload a new SRT file** (or re-upload the test file)
3. **Immediately navigate to the file details page**
4. **Watch both console outputs:**
   - **Server console** (terminal running `npm run dev`)
   - **Browser console** (F12 → Console)

## What to Look For

### Server Console (Terminal)

You should see this sequence:

```
📊 Starting progress tracking for file: clxxx...
🚀 Launching background extraction for file: clxxx...
📝 processVocabularyExtraction called with fileId: clxxx...
Starting vocabulary extraction for file clxxx with 123 entries
📊 Updated progress to 'processing' stage for clxxx
Processing 123 subtitle entries...
Processed 0/123 entries...
Processed 50/123 entries...
87 words meet minimum frequency of 2
Looking up meanings for 87 words using Jisho API...
🔄 Resetting progress tracker for clxxx with 87 words
📊 Progress tracking started for clxxx: 87 words
📊 Updated progress: 1/87 for clxxx
📊 Updated progress: 2/87 for clxxx
📊 Updated progress: 3/87 for clxxx
💨 Session cache hit for "word"
📊 Progress: 10/87 (11%)
📊 Progress: 20/87 (22%)
... continues to 87/87 ...
✅ Progress complete for clxxx: 85 words saved
```

### Browser Console

You should see repeated logs (every 2 seconds):

```javascript
📊 Client received progress data: {
  isProcessing: true,
  percentage: 23,
  vocabularyCount: 0,
  progress: {
    stage: "looking-up",
    message: "Looking up: \"人\" (20/87)",
    currentWord: 20,
    totalWords: 87
  }
}

📊 Setting progress state: {
  isProcessing: true,
  percentage: 23,
  message: "Looking up: \"人\" (20/87)",
  stage: "looking-up",
  currentWord: 20,
  totalWords: 87
}
```

### Progress API Logs (Server)

When the frontend polls, you should see:

```
📊 Progress API for clxxx: {
  hasProgress: true,
  percentage: 23,
  isProcessing: true,
  vocabularyCount: 0,
  stage: 'looking-up',
  currentWord: 20,
  totalWords: 87
}
```

## Common Issues to Check

### Issue 1: No fileId in Background Process
**Look for:** `⚠️ No fileId provided - progress tracking disabled`
**Cause:** The fileId isn't being passed to the extraction function
**Fix:** Check that `processVocabularyExtraction` is being called with the correct fileId

### Issue 2: Progress Tracker Not Starting
**Look for:** Missing `📊 Progress tracking started` log
**Cause:** ProgressTracker.start() isn't being called
**Fix:** Ensure the tracker starts before vocabulary extraction

### Issue 3: Progress Not Updating
**Look for:** Missing `📊 Updated progress` logs
**Cause:** Progress updates aren't being called in the loop
**Fix:** Verify the update calls are inside the word processing loop

### Issue 4: Frontend Not Receiving Data
**Look for:** `📊 Client received progress data:` showing `hasProgress: false`
**Cause:** Progress has expired or wasn't saved
**Fix:** Check that progress map is persisting in memory

### Issue 5: Progress Map Empty
**Look for:** Progress API showing `hasProgress: false` even when processing
**Cause:** Progress tracker might be using a different instance
**Fix:** Ensure ProgressTracker is a singleton (static class)

## Quick Test Commands

```bash
# Check if dev server is running
curl http://localhost:3000

# After uploading, check progress API directly
curl http://localhost:3000/api/files/YOUR_FILE_ID/progress
```

## What The Logs Tell Us

1. **📊 Starting progress tracking** → Upload route correctly initializes tracker
2. **🚀 Launching background extraction** → Background process starts
3. **📝 processVocabularyExtraction called** → Function receives fileId
4. **🔄 Resetting progress tracker** → Actual word count is set
5. **📊 Updated progress** → Each word lookup updates tracker
6. **📊 Progress API** → API returns current progress
7. **📊 Client received** → Frontend gets the data
8. **✅ Progress complete** → Extraction finished

If any step is missing from the logs, that's where the problem is!

## Next Steps

After testing, share:
1. **Server console output** (from terminal)
2. **Browser console output** (from F12 console)
3. **Which step is missing or incorrect**

This will help identify exactly where the progress tracking is breaking down.

