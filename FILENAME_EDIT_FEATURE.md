# ✅ Filename Edit Feature Added to Dashboard

## What's New

Users can now **edit filenames directly from the dashboard** with inline editing!

## Changes Made

### 1. **New API Endpoint** (`app/api/files/[id]/filename/route.ts`)

**PUT `/api/files/[id]/filename`**

- Updates filename for a specific file
- Accepts: `filename` in request body
- Auto-appends `.srt` if not present
- Security: Verifies user owns the file
- Trims whitespace
- Returns updated filename

**Example Request:**
```json
PUT /api/files/clxxx/filename
{
  "filename": "Attack on Titan Episode 1"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Filename updated successfully",
  "filename": "Attack on Titan Episode 1.srt"
}
```

### 2. **Updated Dashboard UI** (`app/dashboard/page.tsx`)

Added inline editing functionality:

**New State Variables:**
- `editingId` - Tracks which file is being edited
- `editFilename` - Stores the edited filename (without .srt)
- `saving` - Loading state during save

**New Functions:**
- `handleEditClick()` - Enters edit mode for a file
- `handleCancelEdit()` - Cancels editing
- `handleSaveFilename()` - Saves the new filename

## Features

### ✅ Inline Editing
- Click "Edit" to edit filename
- Filename field becomes an input box
- `.srt` extension shown separately (non-editable)
- Other actions disabled while editing

### ✅ Smart Extension Handling
- Input shows filename WITHOUT `.srt`
- `.srt` displayed as label next to input
- API automatically adds `.srt` if missing
- User doesn't have to type extension

### ✅ Action Buttons

**Normal Mode:**
- **Edit** - Edit filename
- **View** - View file details
- **Quiz** - Start quiz
- **Delete** - Delete file

**Edit Mode:**
- ✅ **Save** (green checkmark icon)
- ❌ **Cancel** (gray X icon)

### ✅ Validation
- Filename cannot be empty
- Whitespace automatically trimmed
- Duplicate filenames allowed (no unique constraint)

### ✅ Loading States
- Save button shows spinner while saving
- Both buttons disabled during save
- Smooth transition back to normal mode

### ✅ Security
- User authentication required
- User must own the file
- Server-side validation
- Proper authorization checks

## UI States

### Normal State
```
┌──────────────────┬─────────┬───────────┬──────────────────────────────┐
│ Filename         │ Date    │ Vocab     │ Actions                      │
├──────────────────┼─────────┼───────────┼──────────────────────────────┤
│ aot1.srt         │ 1/28/25 │ 87 words  │ Edit View Quiz Delete        │
└──────────────────┴─────────┴───────────┴──────────────────────────────┘
```

### Edit Mode
```
┌──────────────────┬─────────┬───────────┬──────────────────────────────┐
│ Filename         │ Date    │ Vocab     │ Actions                      │
├──────────────────┼─────────┼───────────┼──────────────────────────────┤
│ [aot1______] .srt│ 1/28/25 │ 87 words  │ ✓ ✕                          │
└──────────────────┴─────────┴───────────┴──────────────────────────────┘
```

### Saving State
```
┌──────────────────┬─────────┬───────────┬──────────────────────────────┐
│ Filename         │ Date    │ Vocab     │ Actions                      │
├──────────────────┼─────────┼───────────┼──────────────────────────────┤
│ [aot1______] .srt│ 1/28/25 │ 87 words  │ ⟳ ✕ (disabled)              │
└──────────────────┴─────────┴───────────┴──────────────────────────────┘
```

## User Flow

1. **Navigate to Dashboard**
2. **Click "Edit"** on any file row
   - Filename becomes editable input
   - Extension `.srt` shown as label
   - Other files' actions disabled
3. **Edit the filename**
   - Type new name (without .srt)
   - Preview shows: `[new-name] .srt`
4. **Save or Cancel**
   - **Save**: Updates database → Updates UI immediately
   - **Cancel**: Discards changes → Returns to normal
5. **Success!**
   - New filename displayed
   - File is updated in database
   - All actions re-enabled

## Example Use Cases

### Rename to More Descriptive Name
**Before:** `aot1.srt`
**Edit to:** `Attack on Titan - Episode 1`
**Result:** `Attack on Titan - Episode 1.srt`

### Fix Typo
**Before:** `naruto_epsode_1.srt`
**Edit to:** `naruto_episode_1`
**Result:** `naruto_episode_1.srt`

### Add Context
**Before:** `japanese_lesson.srt`
**Edit to:** `Japanese Lesson - Greetings`
**Result:** `Japanese Lesson - Greetings.srt`

## Button States

### Edit Button
- **Enabled**: When no file is being edited
- **Disabled**: When another file is in edit mode
- **Text**: "Edit"
- **Color**: Blue

### Save Button (Edit Mode)
- **Enabled**: During edit (not saving)
- **Disabled**: While saving
- **Icon**: Checkmark (when enabled), Spinner (when saving)
- **Color**: Green

### Cancel Button (Edit Mode)
- **Enabled**: During edit (not saving)
- **Disabled**: While saving
- **Icon**: X mark
- **Color**: Gray

### Other Actions (View, Quiz, Delete)
- **Enabled**: When no file is being edited
- **Disabled**: When any file is in edit mode

## Accessibility

✅ **Title attributes** - Tooltips for buttons
✅ **Disabled states** - Proper visual feedback
✅ **Keyboard navigation** - Tab through buttons
✅ **Focus management** - Input auto-focused
✅ **Color contrast** - WCAG compliant

## How to Test

1. **Go to Dashboard**
2. **Ensure you have at least one uploaded file**
3. **Click "Edit"** next to a filename
4. **Modify the filename** in the input field
5. **Click the green checkmark** to save
6. **Verify** the filename updates immediately
7. **Try Cancel**:
   - Click Edit again
   - Change the filename
   - Click the gray X
   - Verify changes were discarded

## Technical Notes

- Input strips `.srt` extension for editing
- API automatically adds `.srt` back
- State updates are immediate (optimistic UI)
- Only one file can be edited at a time
- All other actions disabled during edit
- Validation on both client and server

## Database Impact

- Updates `SubtitleFile.filename` field
- No cascade effects
- Vocabulary references remain intact
- Quiz attempts unaffected

## Future Enhancements (Optional)

- Bulk rename multiple files
- Preview before saving
- Filename templates
- Auto-suggest based on content
- Character name detection
- Episode number parsing
- Toast notifications instead of alerts

The filename editing feature is now live on the dashboard! ✏️📝

