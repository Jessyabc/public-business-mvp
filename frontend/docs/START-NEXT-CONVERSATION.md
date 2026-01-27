# Prompt for Next Cursor Agent Conversation

Copy and paste this into a new Cursor conversation to continue work:

---

## Initial Setup

Hi! I'm continuing work on my Public Business MVP project. Please help me get started:

1. **Check git status** and verify we're on `main` branch and up to date with `origin/main`
2. **Read `docs/NEXT-AGENT-ROADMAP.md`** to understand the current status and what needs to be done
3. **Start the dev server** on port 8080 if not already running
4. **Review the pending tasks** from the roadmap

## Current Context

We just completed implementing an account types and organization membership system. The main work is done, but there are a few critical issues to resolve:

### Critical Issue: RLS Policy 403 Errors

Users are getting 403 errors when querying `org_members` with a join to `orgs(*)`. The SQL fix scripts are ready but need to be run in Supabase:

- **File to run:** `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql`
- **What it does:** Adds RLS policies to `orgs` table so the join works, fixes `org_members` policies, creates trigger for auto-filling `org_id` for insights
- **Status:** Script is ready, needs execution in Supabase SQL Editor

### Pending Tasks

1. **Fix RLS 403 Errors** (Priority 1)
   - Run `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql` in Supabase
   - Verify policies exist and work
   - Test frontend - should see no 403 errors, membership data loads, "Owner" badges appear

2. **Wire Business Insights in Discuss Section** (Priority 2)
   - Business insights appear in Research Hub but not in Discuss section
   - Need to investigate and fix feed queries

3. **Update Composer for Org Selection** (Priority 3)
   - Add org selector UI for users with multiple orgs
   - Auto-fill `org_id` for single-org users (trigger handles this)

## Key Files Reference

- **Roadmap:** `docs/NEXT-AGENT-ROADMAP.md` - Complete status and next steps
- **SQL Fixes:** `docs/SUPABASE-INSIGHTS-AND-ORG-FIX.sql` - Ready to run
- **Migration:** `docs/SUPABASE-MIGRATION-CLEANED.sql` - Already applied

## What I Need

Please:
1. Verify the setup (git, dev server)
2. Review the roadmap
3. Help me run the SQL fix in Supabase and verify it works
4. Then tackle the pending tasks in priority order

Let's start with verifying everything is set up correctly and then move to fixing the RLS issues.

---

**Note:** All changes have been committed and pushed to `main` branch. Local is clean and up to date.

