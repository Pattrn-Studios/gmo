# Contributing to GMO Suite

Thank you for contributing to the Global Market Outlook project. This guide outlines the conventions and best practices for contributing code.

## Table of Contents

- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Conventions](#commit-conventions)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Important Considerations](#important-considerations)
- [Testing](#testing)

---

## Project Structure

The GMO Suite is a monorepo with four distinct modules:

| Module | Purpose | Tech Stack |
|--------|---------|------------|
| `gmo-report` | Production report viewer (PRIMARY) | Next.js 14, React 18, TypeScript |
| `gmo-prototype` | Sanity CMS Studio | Sanity v4, React 19, TypeScript |
| `gmo-chart-agent` | AI chart recommendations API | Express, Claude API |
| `gmo-builder` | Translation API + legacy HTML | Node.js, Claude API |

## Development Setup

```bash
# Clone and install
git clone https://github.com/Pattrn-Studios/gmo.git
cd gmo

# Install dependencies for the module you're working on
cd gmo-report && npm install      # Report viewer
cd gmo-prototype && npm install   # Sanity Studio
cd gmo-chart-agent && npm install # Chart agent API
cd gmo-builder && npm install     # Translation API
```

See README.md for environment variable configuration.

## Code Style

### TypeScript/JavaScript

- Use **TypeScript** for all new code in `gmo-report` and `gmo-prototype`
- Use **ES Modules** (`.mjs` or `"type": "module"`) in `gmo-builder`
- Prefer `const` over `let`; avoid `var`
- Use descriptive variable and function names
- Keep functions focused and single-purpose

### React Components

- Use functional components with hooks
- Define prop types using TypeScript interfaces
- Place component files in feature-based directories:
  ```
  components/
  ├── layout/      # Global layout components
  ├── sections/    # Content section components
  └── charts/      # Chart rendering components
  ```

### CSS/Styling

- Use **Tailwind CSS** utility classes in `gmo-report`
- Design tokens are defined in `gmo-report/src/styles/globals.css`
- Extend Tailwind theme in `tailwind.config.js` for custom values
- Use CSS custom properties (`var(--color-*)`) for theming

### Documentation

- Add JSDoc comments to exported functions
- Document complex logic with inline comments
- Update relevant documentation when changing functionality

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependencies |

### Scope

Use the module name as scope:

- `feat(report): Add dark mode toggle`
- `fix(prototype): Fix chart preview rendering`
- `docs(builder): Update API documentation`

### Examples

```bash
# Feature
git commit -m "feat(report): Add French language dropdown to header"

# Bug fix
git commit -m "fix(chart-agent): Handle empty CSV files gracefully"

# Documentation
git commit -m "docs: Update deployment instructions"

# Refactoring
git commit -m "refactor(builder): Extract translation logic to separate module"
```

## Pull Request Guidelines

### Before Submitting

1. **Test locally** - Ensure your changes work in the affected module(s)
2. **Run builds** - Verify the build succeeds:
   ```bash
   cd gmo-report && npm run build
   cd gmo-prototype && npm run build
   ```
3. **Check for regressions** - Test related functionality
4. **Update documentation** - Update docs if behavior changes

### PR Title

Use the same format as commits:
```
feat(report): Add export to PDF functionality
```

### PR Description

Include:
- **What**: Brief description of changes
- **Why**: Motivation for the change
- **How**: Technical approach (if non-obvious)
- **Testing**: How you verified the changes

### Code Review

- Address all review comments before merging
- Keep PRs focused and reasonably sized
- Prefer multiple small PRs over one large PR

## Important Considerations

### Shared Components

**RechartsRenderer is duplicated** in two locations:
- `gmo-report/src/components/charts/RechartsRenderer.tsx` (CANONICAL)
- `gmo-prototype/components/ChartBuilder/RechartsRenderer.tsx` (copy)

When modifying chart rendering:
1. Update the canonical version in `gmo-report` first
2. Copy changes to `gmo-prototype`
3. Test in both viewers

### Deprecated Code

The HTML generator (`gmo-builder/lib/html-generator.js`) is **deprecated**. Do not add new functionality there. Use the Next.js viewer (`gmo-report`) for all report viewing features.

### Design Tokens

Design tokens are defined in:
- `gmo-report/src/styles/globals.css` (CSS custom properties)
- `gmo-report/tailwind.config.js` (Tailwind theme extension)
- `gmo-builder/lib/design-tokens/` (export utilities)

When adding new colors or design values:
1. Add to `globals.css` as CSS custom property
2. Add to `tailwind.config.js` for Tailwind utility classes
3. Update `DESIGN_TOKENS.md` documentation

### Sanity Schema Changes

When modifying Sanity schemas in `gmo-prototype/schemas/`:
1. Update the schema file
2. Test in Sanity Studio locally
3. Consider migration for existing content
4. Update any affected queries in `gmo-report`

## Testing

### Manual Testing Checklist

Before submitting changes:

- [ ] Report viewer renders correctly (`gmo-report`)
- [ ] Sanity Studio works with changes (`gmo-prototype`)
- [ ] Dark mode displays properly (if styling changes)
- [ ] French translation works (if content changes)
- [ ] Charts render all types correctly (if chart changes)
- [ ] Mobile/responsive layout works (if layout changes)

### Build Verification

```bash
# Test all builds
cd gmo-report && npm run build
cd gmo-prototype && npm run build
```

---

## Questions?

- Check existing documentation in the `documentation/` folder
- Review `DEVELOPER_HANDOVER.md` for technical details
- Open an issue for questions or discussions
