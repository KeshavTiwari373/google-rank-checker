const apiKey = 'AIzaSyBZwe4jXP49d4WC1ZLPMvonnTD3BY_vMVw'; // Replace with your API Key
const cseId = '42b8bde10d12c4d9c'; // Custom Search Engine ID

// Function to handle clipboard paste
async function getClipboardContent() {
    try {
        const text = await navigator.clipboard.readText(); // Read text from clipboard
        return text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        return null;
    }
}

document.getElementById('check-rank').addEventListener('click', async () => {
    const keyword = document.getElementById('keyword').value;

    // Retrieve URLs from the input field
    let inputUrls = document.getElementById('urls').value.split(',').map(url => url.trim());

    // Retrieve URLs from clipboard
    let clipboardUrls = await getClipboardContent();

    // Combine clipboard URLs with input URLs
    let urls = clipboardUrls 
        ? clipboardUrls.split(',').map(url => url.trim()) 
        : inputUrls;

    const resultDiv = document.getElementById('result');
    const usageInfoDiv = document.getElementById('usage-info');

    chrome.storage.local.get(['apiUsageCount'], async (result) => {
        const apiUsageCount = result.apiUsageCount || 0;

        if (apiUsageCount >= 90) {
            usageInfoDiv.innerHTML = "Daily API limit reached.";
            return;
        }

        usageInfoDiv.innerHTML = `Queries used today: ${apiUsageCount}`;

        // Get the page number and calculate the "start" parameter
        const pageNumber = parseInt(document.getElementById('pageNumber').value) || 1;
        const startParam = (pageNumber - 1) * 10 + 1; // Google API uses start as result number, so page 2 starts at 11, page 3 at 21, etc.

        // API Request to Google Custom Search
        const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(keyword)}&cx=${cseId}&key=${apiKey}&start=${startParam}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.items) {
                // Process each URL to find its rank
                const ranks = urls.map(url => {
                    const index = data.items.findIndex(item => item.link.includes(url));
                    return index !== -1 ? `Page ${pageNumber}, Rank ${index + 1}` : "Not found"; // Rank is index + 1
                });

                resultDiv.innerHTML = ranks.map((rank, i) => 
                    `<p>URL: ${urls[i]} - ${rank}</p>`
                ).join('');
            } else {
                resultDiv.innerHTML = "No results found.";
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            resultDiv.innerHTML = "Error fetching data.";
        }

        // Increment the API usage count
        chrome.storage.local.set({ apiUsageCount: apiUsageCount + 1 });
    });
});
