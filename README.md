# Famous Quotes Web Application

A modern, responsive web application built with **Python Flask**, **Vanilla JavaScript**, **HTML5**, and **CSS3**. The application showcases a curated collection of 100 well-known quotes with randomized discovery, dynamic keyword search, author filtering, and category filtering.

## Features

- **🎲 Spotlight Random Quote**: Instant randomized quote with smooth transition effects.
- **🏷️ Filter Random Quotes by Category**: Pick a specific category to discover quotes from.
- **🔍 Full-text & Author Search**: Live search debounced for instantaneous lookup by quote keyword, author name, or category.
- **📚 Interactive Filter Dropdowns & Category Chips**: 1-click filtering by category or author with active state indicators.
- **🔊 Text-to-Speech (Web Speech API)**: Listen to any quote read aloud.
- **📋 Copy to Clipboard**: 1-click copying with interactive toast notifications.
- **𝕏 Tweet/Share Integration**: Share your favorite quotes directly to social media.
- **📱 Fully Responsive**: Modern dark-mode layout optimized for mobile, tablet, and desktop screens.

## Project Structure

```
famous-quotes/
├── app.py              # Flask server and REST API endpoints
├── quotes.json         # 100 curated quotes dataset
├── requirements.txt    # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css   # Modern dark theme styles
│   └── js/
│       └── app.js      # Vanilla JS frontend state & DOM controller
├── templates/
│   └── index.html      # HTML5 template
└── test_app.py         # Automated pytest test suite
```

## Getting Started

### 1. Install Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```
Visit `http://localhost:5001` in your browser.

### 3. Run Tests
```bash
pytest
```
