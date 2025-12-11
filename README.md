# WealthFlow - Personal Finance System

This is a React-based Personal Finance Application.

## Deployment to GitHub Pages

1.  **Repository Setup**: Push this code to a GitHub repository.
2.  **Enable Pages**: Go to Settings -> Pages. Select 'GitHub Actions' as the source.
3.  **Workflow**: Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install Dependencies
        run: npm ci
      - name: Build
        run: npm run build
        env:
          REACT_APP_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. **Secrets**: Go to Settings -> Secrets and variables -> Actions. Add `GEMINI_API_KEY`.

## Firebase Integration (Mocked in Demo)

This demo uses `services/storageService.ts` to simulate a database using `localStorage`. To use real Firebase:

1.  Create a Firebase Project at console.firebase.google.com.
2.  Enable **Authentication** (Email/Password) and **Firestore**.
3.  Install Firebase: `npm install firebase`.
4.  Create `src/firebase.ts` with your config.
5.  Replace the functions in `storageService.ts` with real Firestore calls:
    *   `localStorage.getItem` -> `getDocs(collection(db, 'transactions'))`
    *   `localStorage.setItem` -> `addDoc(collection(db, 'transactions'), data)`
