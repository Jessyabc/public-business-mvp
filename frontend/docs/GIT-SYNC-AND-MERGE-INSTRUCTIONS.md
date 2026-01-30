# Git Sync and Merge Instructions

## Current Situation

This is a **Lovable project**. Lovable manages git automatically for changes made through their platform. However, you may have local changes that need to be synced.

## Option 1: If Git Repository Exists (Standard Workflow)

### Step 1: Check Current Status
```bash
git status
git branch -a
git remote -v
```

### Step 2: Ensure You're on Main Branch
```bash
git checkout main
git pull origin main
```

### Step 3: Check for Unmerged Branches
```bash
# List all branches
git branch -a

# Check which branches are merged
git branch --merged main

# Check which branches are NOT merged
git branch --no-merged main
```

### Step 4: Merge Branches to Main
For each branch that needs to be merged:

```bash
# Switch to the branch
git checkout <branch-name>

# Make sure it's up to date
git pull origin <branch-name>

# Switch back to main
git checkout main

# Merge the branch
git merge <branch-name>

# Push to remote
git push origin main

# Delete the branch (local and remote)
git branch -d <branch-name>
git push origin --delete <branch-name>
```

### Step 5: Commit Any Local Changes
```bash
# Check what's changed
git status

# Add all changes
git add .

# Commit
git commit -m "Fix: Business insights feed filter (kind='BusinessInsight')"

# Push to main
git push origin main
```

### Step 6: Close Pull Requests on GitHub
1. Go to your GitHub repository
2. Navigate to "Pull Requests" tab
3. For each open PR:
   - If ready: Click "Merge pull request"
   - If not needed: Click "Close pull request"
4. Delete merged branches from GitHub UI

## Option 2: If No Git Repository (Lovable Auto-Sync)

Since this is a Lovable project:

1. **Check Lovable Dashboard:**
   - Go to your Lovable project dashboard
   - Check if changes are auto-synced
   - Verify all changes are committed

2. **If You Need to Initialize Git:**
   ```bash
   # Get your GitHub repo URL from Lovable
   # Then initialize:
   git init
   git remote add origin <YOUR_GIT_URL>
   git add .
   git commit -m "Fix: Business insights feed filter and composer org selector"
   git branch -M main
   git push -u origin main
   ```

3. **For GitHub PRs/Branches:**
   - Go directly to GitHub
   - Use GitHub UI to merge/close PRs
   - Delete branches via GitHub UI

## Option 3: Manual GitHub Management

If you can't use git locally:

1. **Go to GitHub Repository:**
   - Navigate to your repo on GitHub
   - Check "Branches" tab
   - Check "Pull Requests" tab

2. **Merge PRs:**
   - Open each PR
   - Click "Merge pull request"
   - Confirm merge

3. **Delete Branches:**
   - Go to "Branches" tab
   - Delete any merged/unused branches

4. **Verify Main Branch:**
   - Check that main branch has all latest changes
   - Verify all fixes are present

## Changes Made in This Session

### Code Changes:
1. **`src/features/feed/FeedContainer.tsx`**
   - Changed `BUSINESS_KINDS` from `['Insight']` to `['BusinessInsight']`
   - This fixes the feed not showing business insights

2. **`src/components/composer/BusinessInsightComposer.tsx`**
   - Already had org selector (from previous session)
   - Removed debug logs

3. **`src/lib/feedQueries.ts`**
   - Removed debug logs

### Summary:
- ✅ Fixed business insights not appearing in feed (kind mismatch)
- ✅ Business insight creation already working
- ✅ Org selector already working

## Quick Checklist

- [ ] Check git status (if repo exists)
- [ ] Ensure on main branch
- [ ] Pull latest changes
- [ ] Merge any unmerged branches
- [ ] Commit local changes
- [ ] Push to GitHub
- [ ] Close/merge PRs on GitHub
- [ ] Delete old branches
- [ ] Verify main branch is up to date

## Next Steps After Sync

1. Verify all changes are on GitHub
2. Test that business insights appear in feed
3. Test creating new business insights
4. Ready for next conversation!

---

**Note:** If you're using Lovable's auto-sync, changes may already be on GitHub. Just verify in the GitHub UI that everything is merged and up to date.

