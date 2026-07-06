# Contributing to DocuMind

Thank you for your interest in improving DocuMind! This repository is built to help Express.js developers generate professional Swagger/OpenAPI documentation using Gemini AI.

DocuMind welcomes contributions of all sizes. Whether you are submitting a bug report, refining AI prompts, or improving CLI behavior, your work makes this tool better for everyone.

## 📌 How to Report Bugs

If you discover a bug or unexpected behavior, please follow these steps:

1. Search existing issues to see whether the problem has already been reported.
2. Open a new issue with a clear title and concise description.
3. Include the following:
   - Node.js version
   - `DocuMind` version
   - CLI command you executed
   - minimal reproduction steps
   - relevant console output or error messages

### Good bug report example

```md
Title: CLI fails when `DOCUMIND_API_KEY` is missing but `-k` is provided

Steps:
1. Run `npx documind -k mykey -d ./src`
2. Error: "Gemini API Key is missing"

Expected:
- DocuMind should use the provided key from `-k`.
```

## 🚀 How to Submit Pull Requests

Contributions are welcome via GitHub pull requests.

1. Fork the repository.
2. Create a feature branch with a descriptive name.
3. Commit your changes in small, reviewable units.
4. Open a pull request against the `main` branch.
5. Describe your changes clearly and explain why they improve DocuMind.
6. Add tests or examples when appropriate.

### PR checklist

- [ ] Your branch is up to date with `main`
- [ ] Changes are scoped to a single feature or fix
- [ ] Code follows the project style
- [ ] Documentation is updated if needed
- [ ] No broken builds or linting issues

## 🛠️ Setting Up the Development Environment

Follow these steps to work on DocuMind locally:

```bash
git clone https://github.com/<your-org>/DocuMind.git
cd DocuMind
npm install
npm run build
```

Run in development mode with live TypeScript execution:

```bash
npm run dev
```

### Recommended workflow

- Build before publishing changes: `npm run build`
- Use `npm test` if tests are added
- Keep runtime dependencies minimal and consistent

## 🧑‍💻 Coding Standards

DocuMind prioritizes clean, readable, and maintainable code.

- Use modern TypeScript features where appropriate.
- Keep functions small and focused.
- Prefer explicit types for public interfaces.
- Keep error messages user-friendly and actionable.
- Preserve existing CLI behavior and naming conventions.
- Use comments to clarify intent, not to restate obvious logic.

## ✨ Areas Where Contributions Are Especially Welcome

- **AI prompt refinement**
  - Improve Gemini prompt quality for richer OpenAPI extraction.
  - Reduce invalid JSON responses from the model.
- **Support for new frameworks**
  - Add NestJS, Fastify, Koa, or other server framework support.
  - Expand route detection and context stitching beyond Express.
- **CLI performance improvements**
  - Optimize file scanning and parallel route processing.
  - Improve reporter speed and spinner responsiveness.

## 🙌 Thank You

Your contributions help DocuMind stay useful, modern, and reliable for the community.
