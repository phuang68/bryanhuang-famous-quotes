import json
import os
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'quotes.json')

def load_quotes():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

quotes_data = load_quotes()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats', methods=['GET'])
def get_stats():
    categories = sorted(list({q['category'] for q in quotes_data}))
    authors = sorted(list({q['author'] for q in quotes_data}))
    return jsonify({
        'total_quotes': len(quotes_data),
        'total_categories': len(categories),
        'total_authors': len(authors)
    })

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = sorted(list({q['category'] for q in quotes_data}))
    return jsonify(categories)

@app.route('/api/authors', methods=['GET'])
def get_authors():
    authors = sorted(list({q['author'] for q in quotes_data}))
    return jsonify(authors)

@app.route('/api/quote/random', methods=['GET'])
def get_random_quote():
    category = request.args.get('category', '').strip().lower()
    author = request.args.get('author', '').strip().lower()

    filtered = quotes_data
    if category:
        filtered = [q for q in filtered if q['category'].lower() == category]
    if author:
        filtered = [q for q in filtered if q['author'].lower() == author]

    if not filtered:
        return jsonify({'error': 'No quote found matching the specified criteria.'}), 404

    return jsonify(random.choice(filtered))

@app.route('/api/quotes', methods=['GET'])
def get_quotes():
    query = request.args.get('search', '').strip().lower()
    category = request.args.get('category', '').strip().lower()
    author = request.args.get('author', '').strip().lower()
    page = request.args.get('page', default=1, type=int)
    limit = request.args.get('limit', default=12, type=int)

    filtered = quotes_data

    if category:
        filtered = [q for q in filtered if q['category'].lower() == category]

    if author:
        filtered = [q for q in filtered if author in q['author'].lower()]

    if query:
        filtered = [
            q for q in filtered
            if query in q['quote'].lower() or query in q['author'].lower() or query in q['category'].lower()
        ]

    total = len(filtered)
    limit = max(1, min(limit, 100))
    page = max(1, page)
    total_pages = max(1, (total + limit - 1) // limit)

    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_items = filtered[start_idx:end_idx]

    return jsonify({
        'quotes': paginated_items,
        'total': total,
        'page': page,
        'limit': limit,
        'total_pages': total_pages
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
