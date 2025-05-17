1. Enabling CORS in FastAPI
Challenge:
Browsers enforce the same-origin policy, which blocks our React frontend (http://localhost:3000) from making requests to our FastAPI backend (http://localhost:8000) unless the backend explicitly allows it. Without CORS configured correctly, every request is blocked at the network layer, resulting in opaque errors in the browser console.

python
Copy
Edit
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Why this works & notes:

Preflight support: Setting allow_methods=["*"] and allow_headers=["*"] tells FastAPI to respond to OPTIONS preflight requests with permissive policies.

Credentials: allow_credentials=True is required if you ever send cookies or HTTP auth headers; omitting it causes the browser to drop the Authorization header.

Production caution: In production, restrict allow_origins to your deployed domain(s) and consider allow_methods=["GET","POST"] only for tighter security.

2. Using CRA-Style Environment Variables
Challenge:
Create-React-App (CRA) is wired to use process.env.REACT_APP_*. Attempts to use import.meta.env (a Vite pattern) produce undefined at runtime, because Webpack strips out import.meta.

ts
Copy
Edit
// src/api/api.ts
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
Why this works & notes:

CRA convention: CRA automatically injects any variables prefixed with REACT_APP_ into process.env at build time.

Fallback value: Providing a fallback URL ensures local development still works if .env is misconfigured.

Restart required: Changes to .env require restarting npm start for Webpack to pick them up.

3. Validating URLs with Yup
Challenge:
Users can paste multiple URLs at once. Without validation, malformed URLs or empty lines cause the scraper to hang or throw confusing errors. We need quick client-side checks to prevent bad input from ever reaching the backend.

ts
Copy
Edit
import * as yup from "yup";

const urlSchema = yup
  .string()
  .url("Invalid URL format")
  .required("URL is required");

await urlSchema.validate(someUrl);
Why this works & notes:

Descriptive errors: Yup lets you customize the validation messages (“Invalid URL format”), improving UX.

Synchronous vs async: .validate() returns a Promise, so it won’t block the UI thread for very large inputs, but if you validate hundreds of URLs at once you may still see a slight delay.

Further refinement: For large batches, consider validating only one URL at a time, or offloading to a Web Worker.

4. Parallel Async Scraping with HTTPX
Challenge:
Scraping many URLs sequentially leads to slow performance. We want to fetch in parallel but still handle failures gracefully (one bad URL shouldn’t abort the entire batch).

python
Copy
Edit
import httpx
import asyncio

async def fetch(url: str) -> list[str]:
    async with httpx.AsyncClient() as client:
        r = await client.get(url, timeout=10.0)
    return extract_image_urls(r.text)

async def scrape_all(urls: list[str]) -> list[list[str]]:
    tasks = [fetch(u) for u in urls]
    return await asyncio.gather(*tasks, return_exceptions=True)
Why this works & notes:

Concurrency: asyncio.gather fires off all requests at once.

Error handling: return_exceptions=True ensures that if one fetch raises, the others continue. You can check each result, inspect isinstance(..., Exception), and log failed URLs.

Timeouts: Always specify a client timeout (timeout=10.0) or a hung request will stall your entire scrape.

5. Virtualizing the Image Grid
Challenge:
Rendering dozens or hundreds of <img> elements and their wrappers can slam the browser’s layout and memory. We need to render only what the user actually sees.

tsx
Copy
Edit
import { FixedSizeGrid as Grid } from "react-window";

<Grid
  columnCount={4}
  columnWidth={200}
  height={600}
  rowCount={Math.ceil(images.length / 4)}
  rowHeight={250}
  width={800}
>
  {({ columnIndex, rowIndex, style }) => {
    const idx = rowIndex * 4 + columnIndex;
    return (
      <div style={style}>
        <img src={images[idx]} alt="" loading="lazy" />
      </div>
    );
  }}
</Grid>
Why this works & notes:

Virtualization: Only the cells within the visible viewport (and a small overscan) are ever mounted in the DOM.

Lazy loading: loading="lazy" defers offscreen images from downloading until they scroll into view.

Custom styling: You may need to adjust columnWidth and rowHeight to match your responsive design.

6. Encapsulating Logic in a Custom Hook
Challenge:
Multiple components need to trigger scraping, show loading spinners, and display errors. Managing this state in each component leads to duplication.

ts
Copy
Edit
import { useState } from "react";
import { api } from "../api/api";

export function useScraper() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeImages = async (urls: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.post("/scrape", { urls });
      setImages(result.image_urls);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { images, isLoading, error, scrapeImages };
}
Why this works & notes:

Single source of truth: All stateful logic is in one place, making components simpler.

Reusability: You can call useScraper() in multiple routes or contexts.

Race conditions: If scrapeImages is called again before the first call completes, isLoading toggles off when the first finishes—consider tracking a call ID or cancellation.

7. Creating JWTs with python-jose and passlib
Challenge:
We need secure, stateless authentication. JWTs let us sign user data without server-side sessions. Passwords must be hashed with a robust algorithm.

python
Copy
Edit
from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + expires_delta})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
Why this works & notes:

Security: bcrypt is a well-tested slow hash.

Expiration: The exp claim ensures tokens automatically expire.

Revocation: JWTs are inherently stateless—revoking them requires a blacklist or shortening TTLs.

8. Sending Form-Encoded OAuth2 Login
Challenge:
FastAPI’s built-in OAuth2 form model expects x-www-form-urlencoded, not JSON. Sending JSON to that endpoint yields 422 errors.

ts
Copy
Edit
const form = new URLSearchParams();
form.append("username", email);
form.append("password", password);

await api.post("/auth/token", form, {
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});
Why this works & notes:

Compatibility: Matches OAuth2PasswordRequestForm exactly.

Form spec: URLSearchParams serializes to username=…&password=….

Alternate: If you prefer JSON, create a separate login endpoint on the backend.

9. Managing Dependency Conflicts with Poetry
Challenge:
Upgrading Pydantic to v2 breaks FastAPI <0.100. A mismatched requirements.txt leads to runtime import errors.

toml
Copy
Edit
[tool.poetry.dependencies]
fastapi = "^0.100.0"
pydantic = "^2.0.0"
pydantic-settings = "^2.9.1"
Why this works & notes:

Deterministic installs: Poetry’s lockfile prevents transitive version drift.

Clarity: You see exactly which versions are in use.

Fallback: If you cannot upgrade FastAPI, pin Pydantic to <2.0.0 instead.

10. Running Alembic Migrations on SQLite
Challenge:
Schema changes in production without data loss. SQLite’s ALTER limitations can be tricky.

bash
Copy
Edit
alembic init alembic
alembic revision --autogenerate -m "Create user table"
alembic upgrade head
Why this works & notes:

Auto-generate: Alembic reads your SQLAlchemy models to create migrations.

Manual tweaks: Complex modifications (e.g., dropping columns) require hand-crafted SQL in the revision.

11. Mocking HTTP Calls in Frontend Tests
Challenge:
Unit tests should not hit the real network. We need to simulate API responses.

ts
Copy
Edit
import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.post("/api/auth/token", (req, res, ctx) => {
    return res(ctx.json({ access_token: "fake", token_type: "bearer" }));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
Why this works & notes:

Realistic mocking: MSW intercepts fetch and Axios under the hood.

Isolation: You can define different handlers per test suite.

Caveat: For React Testing Library, wrap components in <BrowserRouter> if they rely on routing.

12. Enforcing Strict TypeScript Settings
Challenge:
Loose TS config leads to hidden bugs. We want to catch all possible mistakes at compile time.

jsonc
Copy
Edit
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "noImplicitAny": true,
    "strictNullChecks": true
  },
  "include": ["src", "vite-env.d.ts"]
}
Why this works & notes:

Comprehensiveness: strict bundles all sub-flags (noUnusedLocals, strictBindCallApply, etc.).

Early feedback: You’ll catch mismatched props, missing return statements, and potential null dereferences before runtime.

13. Recovering from Broken node_modules
Challenge:
Partial installs or conflicting global packages can corrupt CRA’s HMR setup, causing missing Webpack plugins.

bash
Copy
Edit
rm -rf node_modules package-lock.json
npm install
npm start
Why this works & notes:

Clean slate: Removes any corrupted or partial dependencies.

Consistency: Ensures all packages are installed fresh per package.json.

Warning: Deleting package-lock.json will allow newer patch versions; pin carefully if you need exact reproducibility.

14. Adding ESLint Accessibility Rules
Challenge:
We need to enforce basic a11y checks so our UI is usable by screen readers and keyboard-only users.

js
Copy
Edit
// .eslintrc.js
module.exports = {
  extends: ["react-app", "plugin:jsx-a11y/recommended"],
  plugins: ["jsx-a11y"],
};
Why this works & notes:

Automated linting: Flags missing alt text, non-semantic buttons, and focus management issues.

CI integration: You can fail the build if a11y errors are present.

Next step: Integrate jest-axe for runtime and snapshot a11y testing.

15. Dockerizing Frontend & Backend
Challenge:
Simplify local development, testing, and production deployment by containerizing both services.

dockerfile
Copy
Edit
# Backend
FROM python:3.13-slim as backend
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]

# Frontend
FROM node:18-alpine as frontend
WORKDIR /app
COPY frontend/ .
RUN npm install
CMD ["npm", "start"]
Why this works & notes:

Isolation: Each stage has only its runtime dependencies.

Multi-stage: You could extend to build a production frontend image using npm run build and serve via Nginx.

Improvement: Add a docker-compose.yml to orchestrate both services together, share networks, and mount local volumes.
