import json
import pytest
from app import app, quotes_data

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_quotes_dataset_count_and_schema():
    assert len(quotes_data) == 100, f"Expected 100 quotes, found {len(quotes_data)}"
    for item in quotes_data:
        assert 'id' in item and isinstance(item['id'], int)
        assert 'quote' in item and len(item['quote'].strip()) > 0
        assert 'author' in item and len(item['author'].strip()) > 0
        assert 'category' in item and len(item['category'].strip()) > 0

def test_index_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Famous Quotes' in response.data

def test_get_stats(client):
    response = client.get('/api/stats')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total_quotes'] == 100
    assert data['total_categories'] > 0
    assert data['total_authors'] > 0

def test_get_categories(client):
    response = client.get('/api/categories')
    assert response.status_code == 200
    categories = response.get_json()
    assert isinstance(categories, list)
    assert 'Philosophy' in categories
    assert 'Science' in categories

def test_get_authors(client):
    response = client.get('/api/authors')
    assert response.status_code == 200
    authors = response.get_json()
    assert isinstance(authors, list)
    assert 'Albert Einstein' in authors

def test_get_random_quote(client):
    response = client.get('/api/quote/random')
    assert response.status_code == 200
    data = response.get_json()
    assert 'quote' in data
    assert 'author' in data
    assert 'category' in data

def test_get_random_quote_filtered_category(client):
    response = client.get('/api/quote/random?category=Science')
    assert response.status_code == 200
    data = response.get_json()
    assert data['category'] == 'Science'

def test_get_random_quote_filtered_author(client):
    response = client.get('/api/quote/random?author=Albert Einstein')
    assert response.status_code == 200
    data = response.get_json()
    assert data['author'] == 'Albert Einstein'

def test_get_random_quote_not_found(client):
    response = client.get('/api/quote/random?author=NonExistentPerson12345')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data

def test_search_quotes_by_keyword(client):
    response = client.get('/api/quotes?search=Einstein')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total'] > 0
    for quote in data['quotes']:
        assert 'einstein' in quote['author'].lower() or 'einstein' in quote['quote'].lower() or 'einstein' in quote['category'].lower()

def test_search_quotes_by_category(client):
    response = client.get('/api/quotes?category=humor')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total'] > 0
    for quote in data['quotes']:
        assert quote['category'].lower() == 'humor'

def test_pagination(client):
    response = client.get('/api/quotes?limit=5&page=1')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['quotes']) == 5
    assert data['page'] == 1
    assert data['limit'] == 5
    assert data['total'] == 100
    assert data['total_pages'] == 20

def test_export_quotes_csv_all(client):
    response = client.get('/api/quotes/export')
    assert response.status_code == 200
    assert 'text/csv' in response.headers.get('Content-Type', '')
    assert 'attachment; filename=famous_quotes.csv' in response.headers.get('Content-Disposition', '')
    lines = response.data.decode('utf-8').strip().split('\r\n')
    if len(lines) == 1:
        lines = response.data.decode('utf-8').strip().split('\n')
    assert lines[0] == 'ID,Quote,Author,Category'
    # 1 header + 100 rows
    assert len(lines) == 101

def test_export_quotes_csv_filtered(client):
    response = client.get('/api/quotes/export?category=Science&search=Einstein')
    assert response.status_code == 200
    content = response.data.decode('utf-8')
    assert 'Albert Einstein' in content
    assert 'Science' in content

