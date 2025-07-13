---
title: "TIL: Modern Python Package CI/CD with uv, Trusted Publishing, and GitHub Actions"
categories:
  - Blog
tags:
  - TIL
  - Python
  - GitHub Actions
  - PyPi
---

Today I learned how to set up a complete CI/CD pipeline for Python packages using modern tooling. As a first-time package publisher, I wanted to make sure I was using the current best practices rather than outdated approaches from Stack Overflow posts. Here's what I discovered about the modern workflow that's taken over from the old "generate API keys and hope" approach.

## The Two-Workflow Pattern

The key insight is separating **continuous integration** from **releases** using two different GitHub Actions workflows. This prevents accidental releases while ensuring every release is tested.

### CI Workflow (`.github/workflows/ci.yml`)

This runs on every push to catch issues early during development:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.9", "3.10", "3.11", "3.12"]

    steps:
    - uses: actions/checkout@v4
    
    - name: Set up uv
      uses: astral-sh/setup-uv@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      run: uv python install ${{ matrix.python-version }}
    
    - name: Install dependencies
      run: uv sync --dev
    
    - name: Run linting
      run: uv run ruff check .
    
    - name: Run type checking
      run: uv run mypy src/
    
    - name: Run tests
      run: uv run pytest tests/ -v
    
    - name: Test package build
      run: uv build
```

### Release Workflow (`.github/workflows/release.yml`)

This runs only on version tags for controlled publishing:

```yaml
name: Release

on:
  push:
    tags:
      - v*

jobs:
  # First run all the tests
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.9", "3.10", "3.11", "3.12"]

    steps:
    - uses: actions/checkout@v4
    
    - name: Set up uv
      uses: astral-sh/setup-uv@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      run: uv python install ${{ matrix.python-version }}
    
    - name: Install dependencies
      run: uv sync --dev
    
    - name: Run linting
      run: uv run ruff check .
    
    - name: Run type checking
      run: uv run mypy src/
    
    - name: Run tests
      run: uv run pytest tests/ -v
    
    - name: Test package build
      run: uv build

  # Only publish if tests pass
  pypi:
    name: Publish to PyPI
    runs-on: ubuntu-latest
    needs: test  # This makes it wait for tests to pass
    environment:
      name: release
    permissions:
      id-token: write
    
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - run: uv build
      - run: uv publish --trusted-publishing always
```

## The Magic of Trusted Publishing

The biggest game-changer is PyPI's support for OpenID Connect tokens from GitHub Actions. No more API keys to manage or leak!

### Setup Process

1. **Go to PyPI** → "Your projects" → "Manage" → "Publishing" → "Add a new pending publisher"
2. **Fill in details**:
   - PyPI project name: `your-package-name`
   - Owner: `your-github-username`
   - Repository: `your-repo-name`
   - Workflow: `release.yml`
   - Environment: `release`

3. **Create GitHub environment**: Settings → Environments → New environment → `release`

### The Security Model

PyPI only accepts packages from the exact combination of:

- ✅ Specific GitHub repository
- ✅ Specific workflow file
- ✅ Specific environment name
- ✅ Valid OpenID Connect token

No long-lived secrets, no manual token rotation, no security headaches.

## Tags vs Commits: The Release Trigger

This was my biggest "aha" moment. The workflow design uses git tags to control releases:

```bash
# This triggers CI workflow (tests only)
git add .
git commit -m "Fix citation parser bug"
git push

# This triggers release workflow (tests + publish)
git tag v1.0.0
git push origin v1.0.0
```

### Why This Works

- **Prevents accidents**: You can't accidentally publish by pushing code
- **Ensures testing**: Every release runs the full test suite
- **Version control**: Tags create clear release points
- **Rollback friendly**: Easy to see what was released when

## uv Makes Everything Fast

Using `uv` throughout the pipeline eliminates the traditional Python packaging pain:

### Traditional pip approach

```bash
pip install -e .[dev] # Slow dependency resolution
python -m pytest      # Hope the environment is right
python -m build       # Fingers crossed
twine upload dist/*   # Manual token management
```

### Modern uv approach

```bash
uv sync --dev         # Lightning-fast dependency installation
uv run pytest         # Isolated, reproducible environment
uv build              # Fast, reliable builds
uv publish            # Secure, automatic publishing
```

The entire CI/CD pipeline runs in under 2 minutes across multiple Python versions.

## Project Structure That Works

Your `pyproject.toml` needs the right configuration:

```toml
[project]
name = "your-package-name"
version = "1.0.0"
description = "Your package description"
authors = [{name = "Your Name"}]
license = {text = "MIT"} # or whatever you want
readme = "README.md"
requires-python = ">=3.9"
dependencies = [
    "requests>=2.25.0",
]

[dependency-groups]
dev = [
    "mypy>=1.16.1",
    "pytest>=8.4.0",
    "pytest-cov>=6.1.1",
    "ruff>=0.11.12",  # fast Python linting in Rust
    "types-requests>=2.25.0",  # For mypy type checking
]

[build-system]
requires = ["uv_build>=0.7.19,<0.8.0"]
build-backend = "uv_build"
```

## The Complete Development Flow

### Daily Development

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push
# → CI runs: linting, type checking, tests across Python versions
```

### Release Process

```bash
# Update version in pyproject.toml
git add pyproject.toml
git commit -m "Bump version to 1.0.0"
git push

# Create release
git tag v1.0.0
git push origin v1.0.0
# → Release runs: all tests + publish to PyPI
```

### User Installation

```bash
pip install your-package-name
```

## Testing with test.pypi.org

Before going live, test with PyPI's staging environment:

```yaml
# In release.yml, temporarily add:
- run: uv publish --trusted-publishing always --publish-url https://test.pypi.org/legacy/
```

Set up trusted publishing on [test.pypi.org](https://test.pypi.org) first, then users can test install:

```bash
pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ your-package-name
```

### The LLM Plugin Installation Gotcha

If you're building an [LLM](llm.datasette.io) plugin specifically, there's a dependency resolution issue with test.pypi.org that I discovered the hard way. The `llm install` command tries to resolve dependencies from test.pypi.org, but most packages (like `requests` and `llm` itself) don't exist there.

First, make sure you have the LLM tool and the necessary plugins installed:

```bash
# Install the LLM tool if you haven't already
pip install llm

# Install the llm-python plugin to get the 'llm python' command
llm install llm-python
```

Then the workaround is to use LLM's internal pip with both package indexes:

```bash
# This fails - can't find dependencies
llm install --index-url https://test.pypi.org/simple/ your-package-name

# This works - checks test.pypi.org first, falls back to real PyPI for dependencies
llm python -m pip install your-package-name --extra-index-url https://test.pypi.org/simple/
```

The `llm python` command runs pip in LLM's isolated virtual environment, which is especially useful if you installed LLM via Homebrew or `pipx`. The `--extra-index-url` flag tells pip to check test.pypi.org for your package but use real PyPI for everything else. This mirrors what your users will experience when installing from real PyPI.

After installation, verify it worked:

```bash
llm tools list
# Should show your tool

llm -T your_tool_name "test command" --td
# Should work normally
```

## Why This Matters

What I love about this setup is how it creates a reusable template for all future Python packages. The two-workflow pattern (CI on pushes, releases on tags) combined with trusted publishing gives you automated testing, security without API keys, and fast builds with uv. Once you understand this pattern, setting up the next package takes minutes instead of hours. Publishing Python packages in 2025 is dramatically different from outdated tutorials—the modern approach prioritizes security, reliability, and developer experience. After going through this process once, you have a production-ready pipeline that just works.
