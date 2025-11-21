// Global data storage
let currentData = null;

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('json/sample-data.json');
        const data = await response.json();
        currentData = data;
        console.log('Data loaded:', data);
    } catch (error) {
        console.error('Error loading data:', error);
        currentData = generateDemoData();
    }
}

// Generate demo data if loading fails
function generateDemoData() {
    return {
        events: [],
        responses: []
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});