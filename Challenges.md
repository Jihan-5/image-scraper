# Challenges and Design Decisions

This document outlines the many challenges encountered during the development of the Fullstack Image Scraper project, the packages and libraries chosen to address them, logic and code‐level issues, reasons certain steps didn’t work as expected, and proposed improvements for the future.

---

## 1. Cross‐Origin Resource Sharing (CORS)

1. Browsers enforce the same‐origin policy, preventing our React frontend (running on `localhost:3000`) from calling our FastAPI backend (running on `localhost:8000`) without special headers.
2. **Chosen Package**: `fastapi.middleware.cors.CORSMiddleware`.
3. **Implementation**:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
Logic Issue: Forgetting to include allow_credentials=True caused JWT cookie headers to be dropped.

Reason for Failure: The browser blocked the preflight OPTIONS request when allow_methods wasn’t set to ["*"].

Improvement: In production, lock down allow_origins to the deployed frontend URL only, and switch to secure cookies.

## 2. Environment Variable Handling
Challenge: React (Create‐React‐App) does not support Vite’s import.meta.env.

Chosen Approach: Use CRA convention process.env.REACT_APP_*.

Implementation:

ts
Copy
Edit
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
Logic Issue: Using import.meta.env led to undefined at runtime.

Reason for Failure: CRA’s webpack config strips out import.meta.

Improvement: Migrate to Vite if we want modern env syntax, or stick with CRA’s standards.

## 3. URL Validation and Deduplication
Accepting multiple URLs (comma‐separated or multiline) introduces malformed input risk.

Chosen Package: yup or validator in JS for schema validation.

Implementation:

ts
Copy
Edit
import * as yup from "yup";

const urlSchema = yup.string().url().required();
Logic Issue: Validating a large list at once blocked the UI thread.

Reason for Failure: The synchronous validation loop caused React rendering to pause.

Improvement: Throttle validation by chunking the URL list or using a Web Worker.

## 4. Asynchronous Parallel Scraping
Challenge: Sending multiple HTTP requests in parallel to scrape image URLs from several domains.

Chosen Package: Python’s httpx with asyncio.gather, or Node’s Promise.all.

Implementation (FastAPI/Python):

python
Copy
Edit
import httpx
import asyncio

async def fetch(url):
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        return extract_image_urls(r.text)

async def scrape_all(urls):
    tasks = [fetch(u) for u in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results
Logic Issue: Unhandled exceptions in gather crashed the entire task.

Reason for Failure: By default, gather propagates the first exception unless return_exceptions=True.

Improvement: Catch per‐task failures and log URLs that failed, continuing with the rest.

## 5. UI Responsiveness Under Heavy Load
Rendering hundreds of images can freeze the React UI.

Chosen Package: react-virtualized or react-window for virtual scrolling.

Implementation:

tsx
Copy
Edit
import { FixedSizeGrid } from "react-window";
Logic Issue: Initial implementation used a simple CSS grid, loading all images at once.

Reason for Failure: The browser ran out of GPU memory when too many high‐resolution images rendered simultaneously.

Improvement: Lazy‐load image components with loading="lazy" and virtualize the grid.

## 6. State Management Complexity
Managing loading, error, and data states across nested components proved cumbersome.

Chosen Pattern: Custom React Hooks (useScraper, useAuth) with Context for global state.

Implementation:

ts
Copy
Edit
const { images, isLoading, error, scrapeImages } = useScraper();
Logic Issue: Race conditions occurred when multiple scrape requests were fired before the first completed.

Reason for Failure: The shared isLoading flag toggled off by the last‐finishing request, masking errors.

Improvement: Maintain a request‐ID token or stack counter to track concurrent calls precisely.

## 7. Authentication and Authorization
Challenge: Securing endpoints and preserving stateless sessions via JWT.

Chosen Packages: python-jose, passlib[bcrypt].

Implementation:

python
Copy
Edit
from jose import jwt, JWTError
from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
Logic Issue: Token revocation was not supported in this stateless scheme.

Reason for Failure: JWTs cannot be invalidated once issued without a blacklist.

Improvement: Introduce Redis‐backed token blacklisting or switch to opaque tokens with server‐side session storage.

## 8. Form‐Encoded Login vs JSON Body
FastAPI’s OAuth2PasswordRequestForm expects application/x-www-form-urlencoded, but the frontend was sending JSON.

Chosen Fix: Switch frontend login to use FormData:

ts
Copy
Edit
const form = new URLSearchParams();
form.append("username", email);
form.append("password", password);
api.post("/auth/token", form);
Logic Issue: 422 Unprocessable Entity errors due to missing form‐fields.

Reason for Failure: FastAPI validation rejects JSON when a Form dependency is declared.

Improvement: Add a separate JSON‐based login endpoint or unify on one format.

## 9. Dependency Version Conflicts
Upgrading Pydantic to v2 broke compatibility with FastAPI < 0.100.

Chosen Resolution: Upgrade FastAPI to >=0.100.0 to support Pydantic 2, or pin Pydantic <2.

Logic Issue: Installing pydantic-settings triggered an audit conflict.

Reason for Failure: The FastAPI version constraints in requirements.txt clashed with Pydantic’s latest.

Improvement: Use a pyproject.toml with Poetry for deterministic resolution and lock‐file enforcement.

## 10. Database Migrations & Schema Evolution
Challenge: Evolving the SQLite schema without corrupting existing data.

Chosen Package: alembic for migration scripts.

Implementation:

bash
Copy
Edit
alembic init alembic
alembic revision --autogenerate -m "Add user table"
alembic upgrade head
Logic Issue: SQLite’s limited ALTER TABLE support broke some auto‐migrations.

Reason for Failure: SQLite cannot drop or rename columns easily without a full table rebuild.

Improvement: Write manual alembic scripts for complex schema changes, or switch to PostgreSQL for production.

## 11. Testing & Mocking HTTP Calls
Challenge: Writing unit tests that do not hit real network endpoints.

Chosen Package: pytest, requests-mock, or for frontend, msw (Mock Service Worker).

Implementation:

ts
Copy
Edit
// src/__tests__/api.test.ts
import { rest } from "msw";
Logic Issue: Jest’s default JSDOM environment does not support fetch by default.

Reason for Failure: Missing polyfills for global.fetch.

Improvement: Use whatwg-fetch polyfill or switch to Node test runner.

## 12. TypeScript Typing and TSX Compilation
Challenge: Ensuring all props and states are correctly typed.

Chosen Config: strict: true in tsconfig.json.

Implementation:

json
Copy
Edit
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx"
  }
}
Logic Issue: Misaligned hook exports (useImageScraper vs useScraper) broke imports.

Reason for Failure: Inconsistent naming across hook and import paths.

Improvement: Enforce a naming convention and add lint rules to catch mismatches.

## 13. Bundler and Dev‐Server Errors
Challenge: Missing Webpack HMR plugins and react‐refresh entries after a bad npm install.

Chosen Action: Delete node_modules and package-lock.json, re‐run npm install.

Logic Issue: Installing packages outside the CRA root caused misconfiguration.

Reason for Failure: react-scripts could not locate the expected Webpack plugins.

Improvement: Migrate to Vite for faster, more predictable builds and simpler config.

## 14. Improving Accessibility
All interactive elements must have proper aria-label and keyboard focus.

Chosen Tool: eslint-plugin-jsx-a11y for linting.

Implementation:

bash
Copy
Edit
npm install eslint-plugin-jsx-a11y --save-dev
Logic Issue: Custom modal lacked aria-modal="true", preventing screen‐reader announcements.

Reason for Failure: Overlooked accessibility in first iteration.

Improvement: Add automated a11y tests with jest-axe.

## 15. Future Enhancements & Next Steps
Dockerization of both frontend and backend to ensure environment parity.

CI/CD Pipeline: Use GitHub Actions to run tests, linting, and deploy to staging.

Performance Monitoring: Integrate Sentry or Datadog to track runtime errors.

Headless Browser Support: Use Puppeteer or Playwright for scraping JS‐heavy pages.

Mobile App: Wrap the frontend in React Native or Expo for mobile usage.

