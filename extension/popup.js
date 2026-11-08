const API_BASE_URL = 'http://localhost:8787';
const currentUrlInput = document.querySelector("#currentUrl");
const shortenBtn = document.querySelector("#shortenBtn");
const outputSection = document.querySelector("#outputSection");
const shortenedUrlInput = document.querySelector("#shortenedUrl");
const copyBtn = document.querySelector("#copyBtn");
const statusMessage = document.querySelector("#statusMessage");
const expirationSelect = document.querySelector("#expirationSelect");
const customCodeInput = document.querySelector("#customCode");

const STORAGE_KEY = 'tuckUrlData';

function saveToStorage(originalUrl, shortenedUrl) {
  chrome.storage.session.set({
    [STORAGE_KEY]: {
      originalUrl,
      shortenedUrl
    }
  });
}

function clearStorage() {
  chrome.storage.session.remove(STORAGE_KEY);
}

async function loadStoredUrlIfMatch(currentUrl) {
  return new Promise((resolve, reject) => {
      chrome.storage.session.get(STORAGE_KEY, (data) => {
        try {
          if (data[STORAGE_KEY]) {
            const { originalUrl, shortenedUrl } = data[STORAGE_KEY];
            if (originalUrl === currentUrl) {
              // URLs match, show the saved shortened URL
              outputSection.classList.remove("hidden");
              shortenedUrlInput.value = shortenedUrl;
              // statusMessage.textContent = "✓ Loaded from cache";
              resolve();
              return;
            }
          }
          // URLs don't match or no data, clear storage
          clearStorage();
          resolve();
        } catch (err) {
          console.error("Error in storage callback:", err);
          reject(err);
        }
      });
  });
}

async function loadCurrentUrl() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab?.url) 
      throw new Error("Could not read the current URL.");

    currentUrlInput.value = tab.url;
    
    // Load stored URL if it matches current URL
    await loadStoredUrlIfMatch(tab.url);
  } catch (error) {
    currentUrlInput.value = "";
    currentUrlInput.placeholder = "URL unavailable";
    console.error(error);
  }
}

shortenBtn.addEventListener('click', async () => {
  const url = currentUrlInput.value.trim();
  statusMessage.classList.remove("hidden");
  if (!URL.canParse(url)) {
    statusMessage.textContent = "Please enter a valid URL";
    return;
  }

  shortenBtn.disabled = true;
  outputSection.classList.remove("hidden");
  statusMessage.textContent = "Shortening...";

  try {
    const response = await fetch(`${API_BASE_URL}/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        url,
        expiration: expirationSelect.value,
        customCode: customCodeInput.value.trim() || undefined
      })
    });
    const data = await response.json();

    
    if (response.ok) {
      shortenedUrlInput.value = data.shortUrl;
      statusMessage.textContent = "✓ Success! " + data.message;
      // Save to storage on success
      saveToStorage(url, shortenedUrlInput.value);
    } else {
      // Show error message from server if available
      const errorMsg = data.error || "Failed to shorten URL";
      statusMessage.textContent = "✗ Error: " + errorMsg;
      console.error('Failed to shorten URL:', data);
      shortenBtn.disabled = false;  // Re-enable button on error
    }
    //dummy data
    // shortenedUrlInput.value = "https://tuck-url.dev/dummy";
    // statusMessage.textContent = "✓ Success!";
    
  } catch (error) {
    statusMessage.textContent = `✗ Error: ${error.message}`;
    console.error(error);
    shortenBtn.disabled = false;
  }
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(shortenedUrlInput.value);
  statusMessage.textContent = "✓ Copied to clipboard!";
});

currentUrlInput.addEventListener('input', () => {
  shortenBtn.disabled = false;
});
expirationSelect.addEventListener('change', () => {
  shortenBtn.disabled = false;
});
customCodeInput.addEventListener('input', () => {
  shortenBtn.disabled = false;
});

loadCurrentUrl();
