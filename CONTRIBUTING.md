# Contributing to Emojisearch

Thank you for your interest in contributing! This fork focuses on self-hosting, cost optimization, and platform independence.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/emojisearch.git
cd emojisearch

# Install dependencies
pnpm install

# Copy environment template
cp .env.bedrock.example .env
# Edit .env with your configuration

# Start development server
pnpm dev
```

## Project Focus Areas

This fork welcomes contributions in:

- **Self-hosting improvements**: Better deployment options, configuration management
- **Cost optimization**: More efficient AI provider integrations, caching strategies
- **Platform independence**: Removing vendor lock-ins, supporting more deployment targets
- **Enterprise features**: Security enhancements, monitoring, scalability
- **Documentation**: Setup guides, troubleshooting, architecture explanations

## Pull Request Process

1. **Fork the repository** and create a feature branch
2. **Make your changes** with clear, atomic commits
3. **Test thoroughly** - ensure the app builds and runs
4. **Update documentation** if you change functionality
5. **Submit a PR** with a clear description of changes

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for Google Vertex AI
fix: resolve Docker health check timeout
docs: update Bedrock setup instructions
chore: upgrade dependencies to latest versions
```

## Security Best Practices

### Secrets Management

**✅ DO:**
- Use environment variables for all secrets
- Commit only `.env.example` files with placeholder values
- Use IAM roles instead of long-lived credentials when possible
- Document required permissions clearly

**❌ DON'T:**
- Commit `.env` files with real credentials
- Hardcode API keys, passwords, or tokens
- Include AWS access keys in code or docs

### Automated Secret Scanning

We recommend using [TruffleHog](https://github.com/trufflesecurity/trufflehog) in CI:

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  trufflehog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: TruffleHog Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

### Pre-commit Hooks (Optional)

Install locally to catch issues before pushing:

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Prevent committing .env files
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ Error: Attempting to commit .env file!"
    echo "   Only .env.example files should be committed"
    exit 1
fi

# Scan for potential secrets
if command -v trufflehog &> /dev/null; then
    echo "🔍 Scanning for secrets..."
    trufflehog git file://. --since-commit HEAD --only-verified --fail
fi
```

## Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **Formatting**: Project uses standard Nuxt/Vue formatting
- **Naming**: Clear, descriptive variable and function names
- **Comments**: Explain "why" not "what" - code should be self-documenting

## Testing

```bash
# Type checking
pnpm typecheck

# Build test
pnpm build

# Run production build locally
node .output/server/index.mjs
```

## Adding New AI Providers

If adding support for a new AI provider:

1. Create `api/_utils.{provider}.ts` with the implementation
2. Add setup script or clear documentation
3. Update main README with cost comparison
4. Add example configuration to `.env.example`
5. Document any required permissions or setup steps

Example structure:

```typescript
// api/_utils.newprovider.ts
export const generateEmojis = async (prompt: string) => {
  // Your implementation
  return emojis;
};

export const getCachedEmojis = async (prompt: string) => {
  // Caching logic
};

export const cacheEmojis = async (prompt: string, emojis: string[]) => {
  // Cache storage
};
```

## Documentation Standards

- **README.md**: High-level overview, quick start, value proposition
- **README.{feature}.md**: Detailed feature-specific guides
- **Code comments**: Complex logic, security considerations, performance notes
- **Environment variables**: Document all options in `.env.example`

## Release Process

Maintainers will:

1. Review and merge approved PRs
2. Update version in `package.json`
3. Tag releases with semantic versioning
4. Generate release notes from commit messages

## Questions or Issues?

- **Bugs**: Open an issue with reproduction steps
- **Features**: Open an issue to discuss before implementing
- **Questions**: Check existing issues or start a discussion
- **Security**: Email maintainers privately for security vulnerabilities

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make self-hosted emoji search better! 🎉
