# WealthFlow - Personal Finance System

A React-based Personal Finance Application powered by Firebase and Gemini AI.

## Deployment Process (GitHub Pages + Firebase)

This project is configured to deploy automatically to GitHub Pages using GitHub Actions. This process ensures your API keys are injected securely during the build process without being committed to the source code.

### 1. Firebase Setup
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  **Authentication**: Enable **Email/Password** sign-in method.
4.  **Firestore**: Create a **Firestore Database** in **production mode**.
    *   Set rules to allow authenticated users to read/write their own data:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /users/{userId}/{document=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```
5.  **Project Settings**: Go to Project Settings -> General -> Your apps -> Add Web App.
6.  Copy the `firebaseConfig` values (apiKey, authDomain, projectId, etc.).

### 2. GitHub Secrets Setup
To keep your keys secure, store them in GitHub Repository Secrets.

1.  Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2.  Click **New repository secret** and add the following keys (copy values from your Firebase config and Gemini API):

    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `REACT_APP_FIREBASE_API_KEY`: Value from `apiKey`.
    *   `REACT_APP_FIREBASE_AUTH_DOMAIN`: Value from `authDomain`.
    *   `REACT_APP_FIREBASE_PROJECT_ID`: Value from `projectId`.
    *   `REACT_APP_FIREBASE_STORAGE_BUCKET`: Value from `storageBucket`.
    *   `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Value from `messagingSenderId`.
    *   `REACT_APP_FIREBASE_APP_ID`: Value from `appId`.

### 3. GitHub Actions Workflow
Create a file named `.github/workflows/deploy.yml` in your repository with the following content. This script will run on every push to the `main` branch.

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
          # Inject Secrets into Environment Variables during Build
          API_KEY: ${{ secrets.GEMINI_API_KEY }}
          REACT_APP_FIREBASE_API_KEY: ${{ secrets.REACT_APP_FIREBASE_API_KEY }}
          REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.REACT_APP_FIREBASE_AUTH_DOMAIN }}
          REACT_APP_FIREBASE_PROJECT_ID: ${{ secrets.REACT_APP_FIREBASE_PROJECT_ID }}
          REACT_APP_FIREBASE_STORAGE_BUCKET: ${{ secrets.REACT_APP_FIREBASE_STORAGE_BUCKET }}
          REACT_APP_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.REACT_APP_FIREBASE_MESSAGING_SENDER_ID }}
          REACT_APP_FIREBASE_APP_ID: ${{ secrets.REACT_APP_FIREBASE_APP_ID }}

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

### 4. Deploy
Simply push your code to the `main` branch. The Action will trigger, build the app with the secrets, and deploy it.

## Local Development

1.  Create a `.env` file in the root directory.
2.  Add the variables:
    ```
    API_KEY=your_gemini_key
    REACT_APP_FIREBASE_API_KEY=your_firebase_key
    ...
    ```
3.  Run `npm install`.
4.  Run `npm start`.
