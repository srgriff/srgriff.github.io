
// Note:  food search, entries management, and localStorage

// ==================== CONFIGURATION ====================
const USDA_API_KEY = 'qIMjnrXqfw1Q9vDp2UuPHmM4UYOfhR7JIx5qZT7A'; // 
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

// Default goals
const DEFAULT_GOALS = {
    protein: 150,
    fiber: 30
};


let todaysEntries = [];
let searchResults = [];



/**
 * today's date in YYYY-MM-DD format
 */
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

/**
 * goals from localStorage
 */
function getGoals() {
    const stored = localStorage.getItem('nutrition-goals');
    return stored ? JSON.parse(stored) : DEFAULT_GOALS;
}

/**
 * Save goals to localStorage
 */
function saveGoals(goals) {
    localStorage.setItem('nutrition-goals', JSON.stringify(goals));
}

/**
 * Load today's entries from localStorage
 */
function loadTodaysEntries() {
    const today = getTodayDateString();
    const stored = localStorage.getItem(`nutrition-${today}`);
    
    if (stored) {
        const data = JSON.parse(stored);
        todaysEntries = data.entries || [];
    } else {
        todaysEntries = [];
    }
    
    renderTodaysEntries();
    updateDailyTotals();
}



/**
 * Save 
 */
function saveTodaysEntries() {
    const today = getTodayDateString();
    
    // Calculate totals
    const totalProtein = todaysEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
    const totalFiber = todaysEntries.reduce((sum, entry) => sum + (entry.fiber || 0), 0);
    
    const data = {
        date: today,
        entries: todaysEntries,
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalFiber: Math.round(totalFiber * 10) / 10,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`nutrition-${today}`, JSON.stringify(data));
}



/**
 * Search for foods using USDA API
 */
async function searchFoods(query) {
    if (!query.trim()) {
        alert('Please enter a search term');
        return;
    }
    
    // Show loading state
    const foodList = document.getElementById('food-list');
    foodList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⏳</div>
            <p>Searching...</p>
        </div>
    `;
    
    try {
        const response = await fetch(
            `${USDA_API_URL}?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=10`
        );
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        searchResults = processFoodData(data.foods || []);
        renderSearchResults();
        
    } catch (error) {
        console.error('Search error:', error);
        foodList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <p>Error searching for foods. Please check your API key and try again.</p>
            </div>
        `;
    }
}

/**
 * Process raw data 
 */
function processFoodData(foods) {
    return foods.map(food => {
        // Find protein and fiber in nutrients
        const nutrients = food.foodNutrients || [];
        const protein = nutrients.find(n => n.nutrientName === 'Protein')?.value || 0;
        const fiber = nutrients.find(n => 
            n.nutrientName === 'Fiber, total dietary' || 
            n.nutrientName === 'Fiber'
        )?.value || 0;
        
        return {
            id: food.fdcId,
            name: food.description,
            protein: Math.round(protein * 10) / 10,
            fiber: Math.round(fiber * 10) / 10,
            servingSize: '100g', 
            brandName: food.brandName || food.brandOwner || null
        };
    });
}



/**
 * Render search results
 */
function renderSearchResults() {
    const foodList = document.getElementById('food-list');
    
    if (searchResults.length === 0) {
        foodList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>No results found. Try a different search term.</p>
            </div>
        `;
        return;
    }
    
    foodList.innerHTML = searchResults.map((food, index) => `
        <div class="food-item" data-index="${index}">
            <div class="food-header">
                <div class="food-name">
                    ${food.name}
                    ${food.brandName ? `<br><small style="color: #666;">${food.brandName}</small>` : ''}
                </div>
            </div>
            <div class="nutrition-info">
                <div class="nutrition-item">
                    <span class="nutrition-label">Protein</span>
                    <span>${food.protein}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Fiber</span>
                    <span>${food.fiber}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Serving</span>
                    <span>${food.servingSize}</span>
                </div>
            </div>
            <button class="add-btn" onclick="addFoodToToday(${index})">Add to Today</button>
        </div>
    `).join('');
}

/**
 * today's entries
 */
function renderTodaysEntries() {
    const entriesList = document.getElementById('entries-list');
    
    if (todaysEntries.length === 0) {
        entriesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>No foods added yet today</p>
            </div>
        `;
        return;
    }
    
    entriesList.innerHTML = todaysEntries.map((entry, index) => `
        <div class="entry-item">
            <div class="entry-header">
                <strong>${entry.name}</strong>
                <button class="remove-btn" onclick="removeEntry(${index})">Remove</button>
            </div>
            <div class="nutrition-info">
                <div class="nutrition-item">
                    <span class="nutrition-label">Protein</span>
                    <span>${entry.protein}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Fiber</span>
                    <span>${entry.fiber}g</span>
                </div>
                <div class="nutrition-item">
                    <span class="nutrition-label">Serving</span>
                    <span>${entry.servingSize}</span>
                </div>
            </div>
            <small style="color: #999;">Added at ${new Date(entry.timestamp).toLocaleTimeString()}</small>
        </div>
    `).join('');
}

/**
 * Update daily totals display
 */
function updateDailyTotals() {
    const goals = getGoals();
    
    // Calculate totals
    const totalProtein = todaysEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
    const totalFiber = todaysEntries.reduce((sum, entry) => sum + (entry.fiber || 0), 0);
    
    // Update protein
    const proteinEl = document.getElementById('total-protein');
    const proteinProgressEl = document.getElementById('protein-progress');
    if (proteinEl) {
        proteinEl.textContent = Math.round(totalProtein) + 'g';
    }
    if (proteinProgressEl) {
        const proteinPercent = Math.min(100, (totalProtein / goals.protein) * 100);
        proteinProgressEl.style.width = proteinPercent + '%';
    }
    
    // Update fiber
    const fiberEl = document.getElementById('total-fiber');
    const fiberProgressEl = document.getElementById('fiber-progress');
    if (fiberEl) {
        fiberEl.textContent = Math.round(totalFiber) + 'g';
    }
    if (fiberProgressEl) {
        const fiberPercent = Math.min(100, (totalFiber / goals.fiber) * 100);
        fiberProgressEl.style.width = fiberPercent + '%';
    }
}



/**
 * Add a food from search results to today's entries
 */
function addFoodToToday(index) {
    const food = searchResults[index];
    if (!food) return;
    
    const entry = {
        ...food,
        timestamp: new Date().toISOString(),
        entryId: Date.now() // Unique ID for this entry
    };
    
    todaysEntries.push(entry);
    saveTodaysEntries();
    renderTodaysEntries();
    updateDailyTotals();
    
    // Show  feedback
    showNotification('Food added successfully! 🎉');
}

/**
 * Remove an entry from today's list
 */
function removeEntry(index) {
    if (confirm('Remove this food from today\'s entries?')) {
        todaysEntries.splice(index, 1);
        saveTodaysEntries();
        renderTodaysEntries();
        updateDailyTotals();
        
        showNotification('Food removed');
    }
}

/**
 * Show a temporary notification
 */
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Clear all of today's entries
 */
function clearTodaysEntries() {
    if (confirm('Clear all of today\'s entries? This cannot be undone.')) {
        todaysEntries = [];
        saveTodaysEntries();
        renderTodaysEntries();
        updateDailyTotals();
        showNotification('Entries cleared');
    }
}

// ==================== EVENT LISTENERS ====================


function initializeEventListeners() {
    // Search button
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = document.getElementById('search-input').value;
            searchFoods(query);
        });
    }
    
    // Search on Enter key
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchFoods(searchInput.value);
            }
        });
    }
}

/**
 * Add animation styles
 */
function addAnimationStyles() {
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}



/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Initializing Food Tracker App...');
    
    // Check if we're on the search page
    if (document.getElementById('search-page')) {
        loadTodaysEntries();
        initializeEventListeners();
        addAnimationStyles();
        
        // Initialize goals if not set
        if (!localStorage.getItem('nutrition-goals')) {
            saveGoals(DEFAULT_GOALS);
        }
        
        console.log('Food search page initialized');
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Make functions globally accessible for onclick handlers
window.addFoodToToday = addFoodToToday;
window.removeEntry = removeEntry;
window.clearTodaysEntries = clearTodaysEntries;



