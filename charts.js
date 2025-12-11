// app.js - Main Application Logic
// Handles food search, entries management, and localStorage

// note for later do not lose const USDA_API_KEY = 'qIMjnrXqfw1Q9vDp2UuPHmM4UYOfhR7JIx5qZT7A'; // 
// note for later do not lose const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'; //
// charts.js - Chart.js Integration Module
// This file handles all chart creation and updates, make sure titles are correct

// Chart instances 
let weeklyTrendChart = null;
let progressChart = null;
let topFoodsChart = null;

/**
 * Initialize all charts on dashboard page load
 */
function initializeCharts() {
    createWeeklyTrendChart();
    createProgressChart();
    createTopFoodsChart();
    updateAllCharts();
}

/**
 * Create the weekly trend line chart
 */
function createWeeklyTrendChart() {
    const ctx = document.getElementById('weeklyTrendChart');
    if (!ctx) return;

    weeklyTrendChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Protein (g)',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Fiber (g)',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Grams'
                    }
                }
            }
        }
    });
}

/**
 *  progress doughnut chart
 */
function createProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    progressChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Fiber'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#4CAF50', '#2196F3'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '% of goal';
                        }
                    }
                }
            }
        }
    });
}

/**
 *  the top foods pie chart
 */
function createTopFoodsChart() {
    const ctx = document.getElementById('topFoodsChart');
    if (!ctx) return;

    topFoodsChart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['No data yet'],
            datasets: [{
                data: [1],
                backgroundColor: ['#ccc'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + 'g';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Get weekly data 
 *  last 7 days of data
 */
function getWeeklyData() {
    const data = {
        labels: [],
        protein: [],
        fiber: []
    };

    // Get last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dateString = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        data.labels.push(dayName);
        
        // Get data for this date from localStorage
        const dayData = localStorage.getItem(`nutrition-${dateString}`);
        if (dayData) {
            const parsed = JSON.parse(dayData);
            data.protein.push(parsed.totalProtein || 0);
            data.fiber.push(parsed.totalFiber || 0);
        } else {
            data.protein.push(0);
            data.fiber.push(0);
        }
    }

    return data;
}

/**
 * Get today's progress data
 */
function getTodayProgress() {
    const today = new Date().toISOString().split('T')[0];
    const dayData = localStorage.getItem(`nutrition-${today}`);
    
    const goals = JSON.parse(localStorage.getItem('nutrition-goals') || '{"protein": 150, "fiber": 30}');
    
    if (dayData) {
        const parsed = JSON.parse(dayData);
        return {
            proteinPercent: Math.min(100, (parsed.totalProtein / goals.protein * 100).toFixed(1)),
            fiberPercent: Math.min(100, (parsed.totalFiber / goals.fiber * 100).toFixed(1))
        };
    }
    
    return { proteinPercent: 0, fiberPercent: 0 };
}

/**
 * Get top protein sources from all stored data
 */
function getTopProteinSources() {
    const foodTotals = {};
    
   
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nutrition-')) {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.entries) {
                data.entries.forEach(entry => {
                    if (foodTotals[entry.name]) {
                        foodTotals[entry.name] += entry.protein || 0;
                    } else {
                        foodTotals[entry.name] = entry.protein || 0;
                    }
                });
            }
        }
    }
    
    // Convert to array and sort by protein amount
    const sorted = Object.entries(foodTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); 
    
    if (sorted.length === 0) {
        return { labels: ['No data yet'], data: [1] };
    }
    
    return {
        labels: sorted.map(item => item[0]),
        data: sorted.map(item => Math.round(item[1]))
    };
}

/**
 * Calculate statistics for stat cards
 */
function calculateStats() {
    const weeklyData = getWeeklyData();
    
    // Calculate averages (excluding zero days)
    const proteinDays = weeklyData.protein.filter(p => p > 0);
    const fiberDays = weeklyData.fiber.filter(f => f > 0);
    
    const avgProtein = proteinDays.length > 0 
        ? Math.round(proteinDays.reduce((a, b) => a + b, 0) / proteinDays.length)
        : 0;
    
    const avgFiber = fiberDays.length > 0
        ? Math.round(fiberDays.reduce((a, b) => a + b, 0) / fiberDays.length)
        : 0;
    
    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayData = localStorage.getItem(`nutrition-${dateString}`);
        
        if (dayData) {
            const parsed = JSON.parse(dayData);
            if (parsed.entries && parsed.entries.length > 0) {
                streak++;
            } else {
                break;
            }
        } else {
            break;
        }
    }
    
    return { avgProtein, avgFiber, streak };
}

/**
 * Update all charts with fresh data from localStorage
 */
function updateAllCharts() {
    // Update weekly trend
    if (weeklyTrendChart) {
        const weeklyData = getWeeklyData();
        weeklyTrendChart.data.labels = weeklyData.labels;
        weeklyTrendChart.data.datasets[0].data = weeklyData.protein;
        weeklyTrendChart.data.datasets[1].data = weeklyData.fiber;
        weeklyTrendChart.update();
    }
    
    // Update progress
    if (progressChart) {
        const progress = getTodayProgress();
        progressChart.data.datasets[0].data = [progress.proteinPercent, progress.fiberPercent];
        progressChart.update();
    }
    
    // Update top foods
    if (topFoodsChart) {
        const topFoods = getTopProteinSources();
        topFoodsChart.data.labels = topFoods.labels;
        topFoodsChart.data.datasets[0].data = topFoods.data;
        
        // Update colors if we have real data
        if (topFoods.labels[0] !== 'No data yet') {
            topFoodsChart.data.datasets[0].backgroundColor = [
                '#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0'
            ];
        }
        
        topFoodsChart.update();
    }
    
    // Update stat cards
    const stats = calculateStats();
    const streakEl = document.getElementById('streak-value');
    const avgProteinEl = document.getElementById('avg-protein');
    const avgFiberEl = document.getElementById('avg-fiber');
    
    if (streakEl) streakEl.textContent = stats.streak + ' day' + (stats.streak !== 1 ? 's' : '');
    if (avgProteinEl) avgProteinEl.textContent = stats.avgProtein + 'g';
    if (avgFiberEl) avgFiberEl.textContent = stats.avgFiber + 'g';
}

// Initialize charts when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCharts);
} else {
    initializeCharts();
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { updateAllCharts, initializeCharts };
}