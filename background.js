let apiUsageCount = 0;
const dailyLimit = 90;

// Get the current API usage count
chrome.storage.local.get(['apiUsageCount'], (result) => {
    apiUsageCount = result.apiUsageCount || 0;
});

// Check if apiUsageCount is a number
if (typeof apiUsageCount !== "number") {
    apiUsageCount = 0; // Initialize to 0 if it's not a number
}

// Reset the usage count daily (at midnight)
chrome.alarms.create('resetUsageCount', { periodInMinutes: 1440 }); // Reset every 1440 minutes (24 hours)

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'resetUsageCount') {
        chrome.storage.local.set({ apiUsageCount: 0 }, () => {
            console.log('API usage count reset to 0.');
        });
    }
});

// Optional: Function to increment the API usage count
function incrementUsageCount() {
    if (apiUsageCount < dailyLimit) {
        apiUsageCount++;
        chrome.storage.local.set({ apiUsageCount }, () => {
            console.log(`API usage count: ${apiUsageCount}`);
        });
    } else {
        console.log('Daily limit reached. Please try again tomorrow.');
    }
}
