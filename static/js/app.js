/**
 * Famous Quotes Web Application
 * Vanilla JavaScript Frontend Controller
 */

// Application State
const state = {
    search: '',
    category: '',
    author: '',
    randomCategory: '',
    page: 1,
    limit: 12,
    totalPages: 1,
    currentSpotlight: null,
    categories: [],
    authors: []
};

// DOM Elements
const elements = {
    spotlightText: document.getElementById('spotlight-text'),
    spotlightAuthor: document.getElementById('spotlight-author'),
    spotlightCategory: document.getElementById('spotlight-category'),
    spotlightCard: document.getElementById('spotlight-card'),
    btnNewQuote: document.getElementById('btn-new-quote'),
    btnListen: document.getElementById('btn-listen'),
    btnCopySpotlight: document.getElementById('btn-copy-spotlight'),
    btnShareTwitter: document.getElementById('btn-share-twitter'),
    randomCategorySelect: document.getElementById('random-category-select'),
    
    // Stats
    statQuotes: document.getElementById('stat-quotes'),
    statCategories: document.getElementById('stat-categories'),
    statAuthors: document.getElementById('stat-authors'),
    
    // Chips & Filters
    categoryChips: document.getElementById('category-chips'),
    searchInput: document.getElementById('search-input'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    filterCategory: document.getElementById('filter-category'),
    filterAuthor: document.getElementById('filter-author'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnResetFilters: document.getElementById('btn-reset-filters'),
    btnEmptyReset: document.getElementById('btn-empty-reset'),
    themeToggle: document.getElementById('theme-toggle'),
    
    // Grid & Pagination
    quotesGrid: document.getElementById('quotes-grid'),
    emptyState: document.getElementById('empty-state'),
    resultsCount: document.getElementById('results-count'),
    pagination: document.getElementById('pagination'),
    pageInfo: document.getElementById('page-info'),
    btnPrevPage: document.getElementById('btn-prev-page'),
    btnNextPage: document.getElementById('btn-next-page'),
    
    // Toast
    toast: document.getElementById('toast')
};

// Utility: Show Toast Notification
function showToast(message = 'Copied to clipboard!') {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 2400);
}

// Theme Management (Dark / Light Mode)
function initTheme() {
    const savedTheme = localStorage.getItem('quotes_theme');
    if (savedTheme) {
        setTheme(savedTheme, false);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light', false);
    } else {
        setTheme('dark', false);
    }
}

function setTheme(theme, notify = true) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('quotes_theme', theme);
    if (notify) {
        showToast(theme === 'light' ? 'Switched to Light Mode ☀️' : 'Switched to Dark Mode 🌙');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme, true);
}

// Utility: Copy text to clipboard with button feedback
async function copyToClipboard(text, triggerBtn = null) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        if (triggerBtn) {
            const originalText = triggerBtn.innerHTML;
            triggerBtn.innerHTML = '✓';
            triggerBtn.classList.add('btn-copied');
            setTimeout(() => {
                triggerBtn.innerHTML = originalText;
                triggerBtn.classList.remove('btn-copied');
            }, 1800);
        }

        showToast('Quote copied to clipboard! 📋');
    } catch (err) {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy quote');
    }
}

// Utility: Export current quote list to CSV
function exportToCSV() {
    const params = new URLSearchParams();
    if (state.search) params.append('search', state.search);
    if (state.category) params.append('category', state.category);
    if (state.author) params.append('author', state.author);

    const exportUrl = `/api/quotes/export?${params.toString()}`;
    const link = document.createElement('a');
    link.href = exportUrl;
    link.setAttribute('download', 'famous_quotes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exporting quotes to CSV... 📥');
}

// Utility: Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// API: Fetch Metadata Stats
async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (elements.statQuotes) elements.statQuotes.textContent = data.total_quotes;
        if (elements.statCategories) elements.statCategories.textContent = data.total_categories;
        if (elements.statAuthors) elements.statAuthors.textContent = data.total_authors;
    } catch (err) {
        console.error('Error fetching stats:', err);
    }
}

// API: Fetch Categories and Authors
async function fetchFilterOptions() {
    try {
        const [catRes, authRes] = await Promise.all([
            fetch('/api/categories'),
            fetch('/api/authors')
        ]);
        state.categories = await catRes.json();
        state.authors = await authRes.json();

        populateCategoryDropdowns(state.categories);
        populateAuthorDropdown(state.authors);
        renderCategoryChips(state.categories);
    } catch (err) {
        console.error('Error fetching filter options:', err);
    }
}

// UI: Populate Category Dropdowns
function populateCategoryDropdowns(categories) {
    // Spotlight Random Category Dropdown
    elements.randomCategorySelect.innerHTML = '<option value="">🎲 All Categories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        elements.randomCategorySelect.appendChild(opt);
    });

    // Catalog Filter Category Dropdown
    elements.filterCategory.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        elements.filterCategory.appendChild(opt);
    });
}

// UI: Populate Author Dropdown
function populateAuthorDropdown(authors) {
    elements.filterAuthor.innerHTML = '<option value="">All Authors</option>';
    authors.forEach(author => {
        const opt = document.createElement('option');
        opt.value = author;
        opt.textContent = author;
        elements.filterAuthor.appendChild(opt);
    });
}

// UI: Render Category Chips
function renderCategoryChips(categories) {
    elements.categoryChips.innerHTML = '';
    
    // "All" chip
    const allChip = document.createElement('button');
    allChip.className = `chip ${state.category === '' ? 'active' : ''}`;
    allChip.textContent = 'All';
    allChip.dataset.category = '';
    allChip.addEventListener('click', () => handleChipSelect(''));
    elements.categoryChips.appendChild(allChip);

    categories.forEach(cat => {
        const chip = document.createElement('button');
        chip.className = `chip ${state.category === cat ? 'active' : ''}`;
        chip.textContent = cat;
        chip.dataset.category = cat;
        chip.addEventListener('click', () => handleChipSelect(cat));
        elements.categoryChips.appendChild(chip);
    });
}

// Event: Handle Chip Selection
function handleChipSelect(category) {
    state.category = category;
    elements.filterCategory.value = category;
    
    // Update chip active states
    document.querySelectorAll('.category-chips .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.category === category);
    });

    state.page = 1;
    fetchQuotes();
}

// API: Fetch Random Quote for Spotlight
async function fetchRandomQuote() {
    try {
        let url = '/api/quote/random';
        if (state.randomCategory) {
            url += `?category=${encodeURIComponent(state.randomCategory)}`;
        }
        
        // Add subtle animation transition
        elements.spotlightText.style.opacity = '0';
        elements.spotlightAuthor.style.opacity = '0';

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error('Quote not found');
        }
        const quote = await res.json();
        state.currentSpotlight = quote;

        setTimeout(() => {
            elements.spotlightText.textContent = `“${quote.quote}”`;
            elements.spotlightAuthor.textContent = `— ${quote.author}`;
            elements.spotlightCategory.textContent = quote.category;
            
            // Update Twitter share link
            const twitterText = encodeURIComponent(`"${quote.quote}" — ${quote.author}`);
            elements.btnShareTwitter.href = `https://twitter.com/intent/tweet?text=${twitterText}`;

            elements.spotlightText.style.opacity = '1';
            elements.spotlightAuthor.style.opacity = '1';
        }, 150);

    } catch (err) {
        elements.spotlightText.textContent = 'Failed to load quote. Please try again.';
        elements.spotlightAuthor.textContent = '';
        elements.spotlightText.style.opacity = '1';
        elements.spotlightAuthor.style.opacity = '1';
    }
}

// API: Fetch Quotes Catalog
async function fetchQuotes() {
    try {
        const params = new URLSearchParams({
            page: state.page,
            limit: state.limit
        });
        if (state.search) params.append('search', state.search);
        if (state.category) params.append('category', state.category);
        if (state.author) params.append('author', state.author);

        const res = await fetch(`/api/quotes?${params.toString()}`);
        const data = await res.json();

        state.totalPages = data.total_pages || 1;
        renderQuotesGrid(data.quotes, data.total);
        renderPagination(data);
    } catch (err) {
        console.error('Error fetching quotes catalog:', err);
    }
}

// UI: Render Quotes Cards Grid
function renderQuotesGrid(quotes, totalCount) {
    elements.resultsCount.textContent = `${totalCount} ${totalCount === 1 ? 'quote' : 'quotes'} found`;

    if (!quotes || quotes.length === 0) {
        elements.quotesGrid.innerHTML = '';
        elements.emptyState.style.display = 'block';
        elements.pagination.style.display = 'none';
        return;
    }

    elements.emptyState.style.display = 'none';
    elements.quotesGrid.innerHTML = '';

    quotes.forEach(item => {
        const card = document.createElement('article');
        card.className = 'quote-card';
        const searchQuery = state.search || state.author;
        card.innerHTML = `
            <div class="quote-card-header">
                <span class="quote-badge">${highlightMatch(item.category, state.search)}</span>
                <button class="icon-btn btn-card-copy" title="Copy Quote" aria-label="Copy Quote">
                    📋
                </button>
            </div>
            <div class="quote-card-body">
                <p class="card-quote-text">“${highlightMatch(item.quote, searchQuery)}”</p>
                <cite class="card-quote-author">— ${highlightMatch(item.author, searchQuery)}</cite>
            </div>
            <div class="quote-card-footer">
                <a class="icon-btn" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${item.quote}" — ${item.author}`)}" target="_blank" rel="noopener noreferrer" title="Share on Twitter">
                    𝕏
                </a>
            </div>
        `;

        const copyBtn = card.querySelector('.btn-card-copy');
        copyBtn.addEventListener('click', () => {
            copyToClipboard(`"${item.quote}" — ${item.author}`, copyBtn);
        });

        elements.quotesGrid.appendChild(card);
    });
}

// UI: Render Pagination Controls
function renderPagination(data) {
    if (data.total <= state.limit) {
        elements.pagination.style.display = 'none';
        return;
    }

    elements.pagination.style.display = 'flex';
    elements.pageInfo.textContent = `Page ${data.page} of ${data.total_pages}`;
    elements.btnPrevPage.disabled = data.page <= 1;
    elements.btnNextPage.disabled = data.page >= data.total_pages;
}

// Helper: Escape Regex Special Characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper: Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper: Highlight matching search query
function highlightMatch(text, query) {
    if (!text) return '';
    const safeText = escapeHtml(text);
    const trimmedQuery = (query || '').trim();
    if (!trimmedQuery) return safeText;

    const escapedQuery = escapeHtml(trimmedQuery);
    const regex = new RegExp(`(${escapeRegExp(escapedQuery)})`, 'gi');
    return safeText.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Speech Synthesis
function speakCurrentQuote() {
    if (!state.currentSpotlight) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `${state.currentSpotlight.quote}. By ${state.currentSpotlight.author}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    } else {
        showToast('Speech synthesis not supported in this browser.');
    }
}

// Reset all filters
function resetFilters() {
    state.search = '';
    state.category = '';
    state.author = '';
    state.page = 1;

    elements.searchInput.value = '';
    elements.btnClearSearch.style.display = 'none';
    elements.filterCategory.value = '';
    elements.filterAuthor.value = '';

    document.querySelectorAll('.category-chips .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.category === '');
    });

    fetchQuotes();
}

// Setup Event Listeners
function setupEventListeners() {
    // Spotlight Random controls
    elements.btnNewQuote.addEventListener('click', fetchRandomQuote);
    elements.randomCategorySelect.addEventListener('change', (e) => {
        state.randomCategory = e.target.value;
        fetchRandomQuote();
    });

    // Copy Spotlight
    elements.btnCopySpotlight.addEventListener('click', () => {
        if (state.currentSpotlight) {
            copyToClipboard(`"${state.currentSpotlight.quote}" — ${state.currentSpotlight.author}`, elements.btnCopySpotlight);
        }
    });

    // Text to Speech
    elements.btnListen.addEventListener('click', speakCurrentQuote);

    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Export to CSV
    if (elements.btnExportCsv) {
        elements.btnExportCsv.addEventListener('click', exportToCSV);
    }

    // Search input with debounce
    const handleSearch = debounce((e) => {
        state.search = e.target.value.trim();
        state.page = 1;
        elements.btnClearSearch.style.display = state.search ? 'block' : 'none';
        fetchQuotes();
    }, 300);

    elements.searchInput.addEventListener('input', handleSearch);

    // Clear search
    elements.btnClearSearch.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.search = '';
        elements.btnClearSearch.style.display = 'none';
        state.page = 1;
        fetchQuotes();
    });

    // Category Filter Dropdown
    elements.filterCategory.addEventListener('change', (e) => {
        state.category = e.target.value;
        state.page = 1;
        // sync chip
        document.querySelectorAll('.category-chips .chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.category === state.category);
        });
        fetchQuotes();
    });

    // Author Filter Dropdown
    elements.filterAuthor.addEventListener('change', (e) => {
        state.author = e.target.value;
        state.page = 1;
        fetchQuotes();
    });

    // Reset Buttons
    elements.btnResetFilters.addEventListener('click', resetFilters);
    elements.btnEmptyReset.addEventListener('click', resetFilters);

    // Pagination buttons
    elements.btnPrevPage.addEventListener('click', () => {
        if (state.page > 1) {
            state.page--;
            fetchQuotes();
            window.scrollTo({ top: elements.quotesGrid.offsetTop - 100, behavior: 'smooth' });
        }
    });

    elements.btnNextPage.addEventListener('click', () => {
        if (state.page < state.totalPages) {
            state.page++;
            fetchQuotes();
            window.scrollTo({ top: elements.quotesGrid.offsetTop - 100, behavior: 'smooth' });
        }
    });
}

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    fetchStats();
    fetchFilterOptions();
    fetchRandomQuote();
    fetchQuotes();
});
