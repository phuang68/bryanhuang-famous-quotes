# ❝ Famous Quotes Web Application

A modern, responsive, and performant web application built with **Python (Flask)**, **Vanilla JavaScript (ES6+)**, **HTML5**, and **CSS3**. The application showcases a curated collection of 100 timeless quotes across diverse categories with randomized discovery, dynamic keyword search, multi-criteria filtering, text-to-speech audio, and seamless social sharing.

---

## ✨ Features

- **🎲 Spotlight Random Quote Generator**: Instant randomized quote with smooth fade animations and category-filtered random discovery.
- **🔍 Full-Text Live Search**: Substring search with 300ms debouncing across quote text, author names, and categories.
- **🏷️ Interactive Category & Author Filters**: 1-click category chips and synchronized dropdown filters with active state indicators.
- **📄 Client-Driven Pagination**: Dynamic page navigation with result counts and auto-scroll behavior.
- **🔊 Text-to-Speech (Web Speech API)**: Native browser speech synthesis to read quotes aloud.
- **📋 Copy to Clipboard**: 1-click clipboard copying with fallback support and animated toast notifications.
- **𝕏 Social Sharing**: Share quotes directly to 𝕏 (formerly Twitter) with pre-formatted quote and author text.
- **📱 Responsive Dark Theme**: Designed with custom CSS variables, glassmorphism card elements, glowing backdrop gradients, and mobile-first layouts.

---

## 🏗️ Architecture & Tech Stack

```
famous-quotes/
├── app.py              # Flask server, routing, and REST API endpoints
├── quotes.json         # In-memory JSON dataset of 100 quotes
├── test_app.py         # Automated pytest test suite
├── requirements.txt    # Python project dependencies
├── static/
│   ├── css/
│   │   └── style.css   # Modern dark-mode styling & responsive grid layout
│   └── js/
│       └── app.js      # State management, DOM controllers, and Web API integration
└── templates/
    └── index.html      # Semantic HTML5 single-page application shell
```

### Technology Stack
- **Backend**: Python 3.10+, Flask
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Modern CSS3 (Grid & Flexbox)
- **APIs**: Web Speech API (`SpeechSynthesis`), Clipboard API (`navigator.clipboard`)
- **Testing**: `pytest`

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- `pip` (Python package manager)

### 1. Clone the Repository & Navigate to Directory
```bash
cd famous-quotes
```

### 2. Create and Activate a Virtual Environment
```bash
# macOS / Linux:
python3 -m venv .venv
source .venv/bin/activate

# Windows:
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
```bash
python app.py
```

The application will start on `http://localhost:5001`. Open your browser and navigate to this URL.

---

## 📡 REST API Reference

All API endpoints return standard JSON responses.

### 1. Aggregate Statistics
* **Endpoint**: `GET /api/stats`
* **Description**: Returns total count of quotes, unique categories, and unique authors.
* **Example Response**:
  ```json
  {
    "total_authors": 66,
    "total_categories": 8,
    "total_quotes": 100
  }
  ```

### 2. Get Categories
* **Endpoint**: `GET /api/categories`
* **Description**: Returns an alphabetically sorted list of all unique quote categories.
* **Example Response**:
  ```json
  [
    "Courage",
    "Humor",
    "Inspiration",
    "Leadership",
    "Life",
    "Motivation",
    "Success",
    "Wisdom"
  ]
  ```

### 3. Get Authors
* **Endpoint**: `GET /api/authors`
* **Description**: Returns an alphabetically sorted list of all unique authors in the collection.

### 4. Get Random Quote
* **Endpoint**: `GET /api/quote/random`
* **Query Parameters**:
  - `category` *(optional)*: Filter random selection by category (e.g. `Wisdom`).
  - `author` *(optional)*: Filter random selection by author.
* **Example Response**:
  ```json
  {
    "author": "Albert Einstein",
    "category": "Wisdom",
    "quote": "Life is like riding a bicycle. To keep your balance, you must keep moving."
  }
  ```

### 5. Get Quotes Catalog (Search & Pagination)
* **Endpoint**: `GET /api/quotes`
* **Query Parameters**:
  - `search` *(optional)*: Case-insensitive search keyword across quote text, author, and category.
  - `category` *(optional)*: Filter by exact category match.
  - `author` *(optional)*: Filter by partial author name match.
  - `page` *(optional, default: `1`)*: Page number.
  - `limit` *(optional, default: `12`, max: `100`)*: Number of items per page.
* **Example Response**:
  ```json
  {
    "limit": 12,
    "page": 1,
    "quotes": [
      {
        "author": "Nelson Mandela",
        "category": "Inspiration",
        "quote": "The greatest glory in living lies not in never falling, but in rising every time we fall."
      }
    ],
    "total": 100,
    "total_pages": 9
  }
  ```

### 6. Export Quotes to CSV
* **Endpoint**: `GET /api/quotes/export`
* **Query Parameters**:
  - `search` *(optional)*: Filter export by search term.
  - `category` *(optional)*: Filter export by category.
  - `author` *(optional)*: Filter export by author.
* **Response**: Returns a downloadable CSV file (`famous_quotes.csv`) with columns `ID,Quote,Author,Category`.

---

## 🧪 Running Tests

The test suite is written using `pytest` and tests route availability, filter combinations, boundary cases, and pagination math.

To execute the test suite:
```bash
pytest
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
