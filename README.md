# food-tracker
This is my 2025 Capstone project to track protein and fiber food tracker using the USDA API


# Food Tracker - Protein & Fiber Nutrition Tracker

Track your daily protein and fiber intake using real food data from the USDA FoodData Central API.

## 🎯 Features

- **Food Search**: Search 300,000+ foods from USDA database
- **Daily Tracking**: Add foods and track protein/fiber intake
- **Data Visualization**: View weekly trends with Chart.js
- **Goal Progress**: See real-time progress toward daily goals
- **Data Persistence**: All data saved to localStorage
- **Responsive Design**: Works on mobile, tablet, and desktop

```


## 📊 Technologies Used

- HTML5, CSS3, JavaScript
- USDA FoodData Central API
- Chart.js for data visualization
- localStorage for data persistence
- CSS Grid & Flexbox for responsive layout



## 📁 File Structure
```
food-tracker/
├── index.html       # Food search page
├── dashboard.html   # Analytics dashboard
├── style.css        # All styles
├── app.js          # Main app logic
├── charts.js       # Chart.js integration
└── README.md       # Documentation
```

## 🚀 Setup Instructions

### 1. Get USDA API Key
1. Visit https://fdc.nal.usda.gov/api-key-signup.html
2. Sign up (free! No credit card)
3. Copy your API key from email

### 2. Install API Key
Open `app.js` and add your key on line 5:
```javascript
const USDA_API_KEY = 'your-api-key-here';
```

### 3. Run the Project

- Install Live Server extension
- Right-click `index.html` → "Open with Live Server"


### Future goals for this Project
- Make serving sizes changable
- Make buttons for most searched items
- Make a goal editor for fiber/protein goals



##     When Using the Project

1. Search for "chicken" - should see results
2. Add food - appears in "Today's Entries"
3. Check progress bars update
4. Refresh page - data persists
5. View dashboard - see charts

***This project is also available on my github page: https://srgriff.github.io/dashboard.html*** and has it's own repo


Has been tested via github page on opera(mobile), Edge via github page/live server, Chrome via page/live server



## 👤 Author


Shannon Griffith - Code You Web Dev 2025 Capstone Project
