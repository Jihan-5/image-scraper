# Fullstack Image Scraper

A fullstack web application that lets users input one or multiple URLs and scrapes all images found on those pages.

## Project Structure
```
image-scraper/
├── backend/
│   ├── app/
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
├── Challenges.pdf       ← Design & challenges write-up
└── README.md            ← This file
```

## Quick Start

### 1. Clone the Repo
```bash
git clone https://github.com/YOUR_USERNAME/image-scraper.git
cd image-scraper
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

Visit `http://localhost:3000` to use the app.

## Tech Stack
- **Frontend:** React (TypeScript), React Router, Axios, Tailwind CSS, React-Toastify
- **Backend:** FastAPI (Python), Uvicorn, SQLAlchemy (SQLite)
- **Deployment:** Vercel (frontend), Railway (backend)

## Environment Variables
Create a `.env` in both folders:

**backend/.env**
```
SECRET_KEY=your_jwt_secret
DATABASE_URL=sqlite:///./db.sqlite3
```

**frontend/.env**
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

## API Docs
Once the backend is running, view OpenAPI docs at `http://localhost:8000/docs`.

## Contributing
PRs welcome! Please fork the repo and submit a pull request with clear descriptions of your changes.

