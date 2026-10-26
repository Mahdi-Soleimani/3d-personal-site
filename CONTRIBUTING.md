# Contributing Guidelines

Thank you for your interest in contributing to this project!

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Mahdi-Soleimani/3d-personal-site.git
   cd 3d-personal-site
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

## Code Quality Standards

Before submitting a pull request, ensure all validation gates pass:

```bash
# Verify TypeScript types
npm run typecheck

# Check code formatting & lint rules
npm run lint

# Run automated tests
npm run test

# Validate production build
npm run build
```

## Pull Request Guidelines

- Create a feature branch from `main`: `git checkout -b feature/my-enhancement`
- Write clear, concise commit messages
- Ensure PR passes all CI checks on GitHub Actions
