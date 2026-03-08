# 👔 ClosetAI — AI-Powered Digital Closet

ClosetAI is a full-stack application that lets you digitize your wardrobe, automatically classify clothing items with AI, and get personalised outfit recommendations.

---

## ✨ Features

| Feature | Description |
|---|---|
| **AI Clothing Scanner** | Upload a photo → OpenAI Vision classifies type, colour, pattern, style, season |
| **Digital Closet** | Browse, filter, edit and delete your clothing items |
| **AI Outfit Recommender** | Get outfit suggestions based on occasion, weather, and style preference |
| **Save Outfits** | Bookmark your favourite looks |

---

## 🛠 Tech Stack

- **Frontend:** React 19 + Vite, React Router, Axios, React Dropzone
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, SQLite
- **AI/ML:** OpenAI Vision API (`gpt-4o-mini`) + GPT for recommendations
- **Storage:** Local file system (drop-in S3-ready)

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys) *(optional — the app works with mock data without one)*

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/closetai.git
cd closetai
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate          # macOS / Linux
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | *(required for AI)* | Your OpenAI API key |
| `DATABASE_URL` | `sqlite:///./closetai.db` | Database connection string |
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded images |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

> **Note:** Without an `OPENAI_API_KEY`, the app uses realistic mock classification and recommendation data so you can still explore all features.

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/clothing` | Upload & classify a clothing item |
| `GET` | `/api/clothing` | List all items (supports filters) |
| `GET` | `/api/clothing/{id}` | Get a specific item |
| `PUT` | `/api/clothing/{id}` | Update an item |
| `DELETE` | `/api/clothing/{id}` | Delete an item |
| `POST` | `/api/outfits/recommend` | Get AI outfit recommendation |
| `GET` | `/api/outfits` | List saved outfits |
| `POST` | `/api/outfits` | Save an outfit |
| `DELETE` | `/api/outfits/{id}` | Delete a saved outfit |

### Filter clothing items

```
GET /api/clothing?clothing_type=Jeans&style=Casual&season=Summer&search=blue
```

---

## 📁 Project Structure

```
closetai/
├── backend/
│   ├── main.py              # FastAPI entry point + CORS + static files
│   ├── models.py            # SQLAlchemy ORM models (ClothingItem, Outfit)
│   ├── database.py          # DB engine + session factory
│   ├── routers/
│   │   ├── clothing.py      # CRUD endpoints for clothing items
│   │   └── outfits.py       # Outfit recommendation + management endpoints
│   ├── services/
│   │   ├── vision.py        # OpenAI Vision classification (+ mock fallback)
│   │   └── recommender.py   # GPT outfit recommendation (+ mock fallback)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ClothingCard.jsx
│   │   │   └── OutfitCard.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Closet.jsx
│   │   │   └── Outfits.jsx
│   │   ├── services/
│   │   │   └── api.js       # Axios API client
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css        # Global design system
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── README.md
└── .gitignore
```

---

## 🎨 Screenshots

| Dashboard | Closet | Outfit Recommender |
|---|---|---|
| Overview with stats and recent items | Browse & filter your wardrobe | AI-generated outfit combinations |

---

## 🔒 Security Notes

- Never commit your `.env` file — it's excluded by `.gitignore`
- Images are stored locally; for production consider cloud storage (S3, GCS)
- For production, set `CORS_ORIGINS` to your actual frontend domain

---

## 📄 License

MIT
