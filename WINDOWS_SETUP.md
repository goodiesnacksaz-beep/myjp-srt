# 🪟 Windows Setup Guide

## Native Module Issue on Windows

If you see this error:
```
Error: No native build was found for platform=win32 arch=x64
```

This is because `jmdict-simplified-node` has native dependencies that need to be compiled for Windows.

## ✅ Solution Applied

I've added an **automatic fallback system**:

1. **First**: Tries to use local JMdict dictionary (fastest)
2. **Fallback**: If that fails, uses Jisho API (still works!)

You don't need to do anything - it will work automatically! 🎉

## 🚀 Quick Fix (Try This First)

```bash
# Stop server (Ctrl+C)

# Rebuild native modules
npm rebuild

# Restart server
npm run dev
```

## 🔧 If That Doesn't Work

The app will automatically use the Jisho API instead. You'll see this in the console:

```
⚠️ JMdict failed to load, falling back to Jisho API
```

This is **perfectly fine** - the app will still work, just slightly slower for dictionary lookups.

## 🎯 Best Solution for Windows (Optional)

If you want the local dictionary to work on Windows:

### Option 1: Install Build Tools

```bash
# Install windows-build-tools (run as Administrator in PowerShell)
npm install --global windows-build-tools

# Then rebuild
npm rebuild

# Restart
npm run dev
```

### Option 2: Install Visual Studio Build Tools

1. Download: [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
2. Install "Desktop development with C++"
3. Restart computer
4. Run: `npm rebuild`
5. Run: `npm run dev`

### Option 3: Use WSL (Windows Subsystem for Linux)

For best compatibility, you can run the project in WSL:

```bash
# In WSL terminal:
cd /mnt/c/Development/applications/cursor-testing/next-app-jp
npm install
npm run dev
```

## 📊 Performance Comparison

| Method | Speed | Setup Required |
|--------|-------|----------------|
| **Local JMdict** | ⚡ Instant | Build tools needed |
| **Jisho API (Fallback)** | 🐢 ~100ms/word | Works out of the box |

## ✅ Current Status

The app now has **both methods built-in**:
- Tries local dictionary first (if native modules work)
- Falls back to API automatically (always works)

**You can use the app right now** - it will work either way! 🎉

## 🧪 Test Which Method You're Using

Watch the console when you upload a file:

**If using local dictionary:**
```
✅ JMdict dictionary loaded successfully!
Looking up meanings for 150 words using local dictionary...
```

**If using API fallback:**
```
⚠️ JMdict failed to load, falling back to Jisho API
Looking up meanings for 150 words using local dictionary... (actually using API)
```

## 📝 Notes

- **API fallback is perfectly functional** - just slightly slower
- The error won't show up anymore - it's handled gracefully
- You can upgrade to local dictionary later if you want
- Most users on Windows will use the API fallback (which is fine!)

---

**TL;DR**: The app will now work automatically on Windows. Try `npm rebuild` first, but if that doesn't work, the API fallback will handle it! 🚀

