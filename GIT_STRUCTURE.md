# Prompts4U - Git Structure Guide

## Overview

This repository uses a **single monorepo** structure where all code is tracked in one git repository. This is different from using git submodules - everything lives in one place and is versioned together.

```
prompts4u.dev/
├── .git/                 # Single git repository for everything
├── .gitignore            # Root gitignore for the monorepo
├── prompts4u-frontend/   # Next.js frontend application
│   ├── .gitignore        # Frontend-specific gitignore (inherited from root)
│   └── ...               # Frontend source code
├── prompts4u-backend/    # NestJS backend application
│   ├── .gitignore        # Backend-specific gitignore (inherited from root)
│   └── ...               # Backend source code
└── packages/             # Shared packages (types, utilities)
    └── types/            # Shared TypeScript types
```

## How Git Works Here

### Single Repository Model

- **One `.git` folder** at the root (`prompts4u.dev/.git/`)
- **No submodules** - frontend and backend are just folders within the repo
- **All changes tracked together** - one commit can include changes from both frontend and backend

### Why This Structure?

1. **Simpler workflow** - No need to manage multiple repositories or submodule references
2. **Atomic commits** - Changes that span frontend and backend can be committed together
3. **Single source of truth** - One commit hash represents the entire project state
4. **Easier CI/CD** - One repository to build, test, and deploy

### Making Commits

All git commands are run from the root directory:

```bash
# Navigate to the root
cd prompts4u.dev

# See all changes across the entire monorepo
git status

# Stage changes from any folder
git add prompts4u-frontend/components/payment/upgrade-modal.tsx
git add prompts4u-backend/src/modules/payments/payments.service.ts

# Or stage everything
git add -A

# Commit with a message describing the changes
git commit -m "Fix payment verification flow"
```

### Ignored Files

The root `.gitignore` handles common patterns for both frontend and backend:

- `node_modules/` - Dependencies (using `**/` to match in any subdirectory)
- `.env` files - Environment variables (`.env.example` is tracked)
- Build outputs (`.next/`, `dist/`, `build/`)
- IDE files (`.idea/`, `.vscode/`)
- Platform files (`.DS_Store`, `Thumbs.db`)

### Branching Strategy

- **`main`** - Primary development branch
- Feature branches should be named `feature/description`
- Bug fix branches should be named `fix/description`

```bash
# Create a feature branch
git checkout -b feature/payment-improvements

# After making changes
git add -A
git commit -m "Improve payment link polling"
git push origin feature/payment-improvements
```

## Remote Repository

The main remote is hosted on GitHub:

```bash
# Check remotes
git remote -v

# Add the main remote (if not already set)
git remote add origin https://github.com/anshul-tatware1712/promtps4u.git

# Push to main
git push -u origin main
```

## Common Workflows

### Daily Development

```bash
# Pull latest changes
git pull origin main

# Make your changes in frontend and/or backend

# Review what changed
git status
git diff

# Stage and commit
git add -A
git commit -m "Description of changes"

# Push to remote
git push
```

### Viewing History

```bash
# See all commits (including frontend and backend changes)
git log --oneline

# See commits only for frontend
git log --oneline -- prompts4u-frontend/

# See commits only for backend
git log --oneline -- prompts4u-backend/

# See what files changed in a commit
git show --stat HEAD
```

### Troubleshooting

**Q: Why don't I see changes in `git status`?**

A: Make sure you're running git commands from the root directory (`prompts4u.dev/`). The `.git` folder is only at the root level.

```bash
# Check your current directory
pwd

# Should show: /path/to/prompts4u.dev
# If you're in a subfolder, go up:
cd ../../
```

**Q: Can I have separate commit histories for frontend and backend?**

A: Yes, you can view filtered history:
```bash
# Frontend-only history
git log --oneline -- prompts4u-frontend/

# Backend-only history
git log --oneline -- prompts4u-backend/
```

**Q: What if I want to ignore a file only in frontend?**

A: You can add frontend-specific ignore rules in `prompts4u-frontend/.gitignore`. Git will use both the root and local `.gitignore` files.

## Remote Repositories

```bash
# View configured remotes
git remote -v

# Add origin
git remote add origin https://github.com/anshul-tatware1712/promtps4u.git

# Push main branch
git push -u origin main

# Set up branch tracking for feature branches
git push -u origin feature/payment-improvements
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `git status` | Show all changed files in the monorepo |
| `git add -A` | Stage all changes |
| `git add <path>` | Stage specific file/folder |
| `git commit -m "msg"` | Commit staged changes |
| `git log --oneline` | Show commit history |
| `git log --oneline -- <path>` | Show history for specific path |
| `git diff` | Show unstaged changes |
| `git push origin main` | Push to main branch |
| `git pull origin main` | Pull from main branch |

---

**Last Updated:** March 14, 2026
