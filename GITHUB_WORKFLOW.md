# GitHub Workflow Guide

## Setting Up the Repository

### 1. Initial Setup (Do Once)

```bash
# Make sure you're in the VoiceGuard directory
cd c:\VoiceGuard

# Check current git status
git status

# If not already a git repo, initialize:
git init
git branch -M main

# Add the remote (if not already added)
git remote add origin https://github.com/m1lestones/voiceguard.git

# Or if remote exists, verify it:
git remote -v
```

### 2. Create Feature Branches

Each team member should create their own branch:

```bash
# You (Backend)
git checkout -b feature/backend-api
git push -u origin feature/backend-api

# Elliot (Frontend)
git checkout -b feature/frontend-api
git push -u origin feature/frontend-api

# Juan (ML Integration)
git checkout -b feature/ml-integration
git push -u origin feature/ml-integration
```

---

## Daily Workflow

### Starting Work (Each Morning)

```bash
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Switch to your feature branch
git checkout feature/your-branch-name

# 4. Merge main into your branch (to get latest changes)
git merge main
```

### Making Changes

```bash
# 1. Make your changes to files
# 2. Stage your changes
git add .

# 3. Commit with descriptive message
git commit -m "Add: Backend API endpoints for enrollment"

# 4. Push to your branch
git push origin feature/your-branch-name
```

### Good Commit Messages

✅ **Good:**
- `Add: Backend API endpoint for voice verification`
- `Fix: Authentication token expiration issue`
- `Update: Frontend to use new API endpoints`
- `Refactor: Voice detection logic for better accuracy`

❌ **Bad:**
- `fix stuff`
- `updates`
- `changes`

---

## Merging to Main

### Option 1: Pull Request (Recommended)

1. **Push your branch:**
   ```bash
   git push origin feature/your-branch-name
   ```

2. **Go to GitHub:**
   - Navigate to: https://github.com/m1lestones/voiceguard
   - Click "Pull Requests" → "New Pull Request"
   - Select your branch → main
   - Add description of changes
   - Request review from team members
   - Merge when approved

### Option 2: Direct Merge (For Quick Fixes)

```bash
# 1. Make sure you're on main
git checkout main
git pull origin main

# 2. Merge your feature branch
git merge feature/your-branch-name

# 3. Push to main
git push origin main
```

---

## Resolving Conflicts

If you get merge conflicts:

```bash
# 1. Git will show conflicted files
# 2. Open the files and look for:
<<<<<<< HEAD
Your changes
=======
Other person's changes
>>>>>>> branch-name

# 3. Edit to keep what you need, remove conflict markers
# 4. Stage the resolved files
git add .

# 5. Complete the merge
git commit -m "Resolve merge conflicts"
```

---

## File Organization

### What Goes Where

```
VoiceGuard/
├── backend/          (You - Backend code)
│   ├── server.js
│   ├── routes/
│   └── package.json
├── src/              (Elliot - Frontend code)
│   ├── lib/
│   │   └── api.ts    (Elliot - API integration)
│   └── pages/
├── src/lib/
│   └── detection.ts  (Juan - ML integration)
└── README.md         (Everyone - Update as needed)
```

### .gitignore

Make sure `.gitignore` includes:
```
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
```

---

## Branch Protection (Optional)

To prevent accidental pushes to main:

1. Go to GitHub → Settings → Branches
2. Add rule for `main` branch
3. Require pull request reviews
4. Require status checks to pass

---

## Quick Reference Commands

```bash
# See what branch you're on
git branch

# See changes you've made
git status

# See commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all uncommitted changes
git checkout .

# Create new branch from main
git checkout main
git pull origin main
git checkout -b feature/new-feature
```

---

## Team Coordination

### Before Starting Work Each Day:
1. Pull latest from main
2. Merge main into your branch
3. Resolve any conflicts
4. Start coding

### Before Ending Work:
1. Commit your changes
2. Push to your branch
3. Update team on progress

### Weekly:
1. Create pull request for completed features
2. Review each other's code
3. Merge approved PRs to main
4. Deploy to staging/production

---

## Deployment Workflow

### Staging (For Testing)

```bash
# Deploy to staging branch
git checkout staging
git merge main
git push origin staging
# Auto-deploys to staging URL
```

### Production

```bash
# Deploy to production
git checkout main
git pull origin main
# Tag the release
git tag -a v1.0.0 -m "MVP Release"
git push origin v1.0.0
# Auto-deploys to production
```

---

## Troubleshooting

### "Permission denied"
- Make sure you're added as collaborator on GitHub
- Check your GitHub authentication (SSH keys or HTTPS token)

### "Branch is behind"
```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

### "Can't push to main"
- Use feature branches and pull requests instead
- Or if you have permission, use: `git push origin main --force` (careful!)

### "Remote repository not found"
```bash
# Check remote URL
git remote -v

# If wrong, update it:
git remote set-url origin https://github.com/m1lestones/voiceguard.git
```

---

## Best Practices

1. ✅ **Always pull before starting work**
2. ✅ **Commit frequently** (small, logical commits)
3. ✅ **Write clear commit messages**
4. ✅ **Use feature branches** (don't work directly on main)
5. ✅ **Test before pushing**
6. ✅ **Communicate with team** about breaking changes
7. ✅ **Keep main branch stable** (only merge working code)

---

## GitHub Actions (CI/CD) - Optional

Create `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

This automatically runs tests on every push.

---

**Questions?** Ask in team chat or GitHub Issues!
