document.addEventListener('DOMContentLoaded', function () {
  const speedSelector = document.getElementById('speedSelector');

  // Load the last selected speed from localStorage (if available)
  const lastSpeed = localStorage.getItem('lastSpeed') || '1.0'; // Default to 1.0x if no lastSpeed saved
  speedSelector.value = lastSpeed;

  // When the user selects a speed, save it to localStorage
  speedSelector.addEventListener('change', function () {
    const selectedSpeed = speedSelector.value;
    localStorage.setItem('lastSpeed', selectedSpeed); // Save the selected speed
    // Notify the content script to change the video speed
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: changeVideoSpeed,
        args: [parseFloat(selectedSpeed)]
      });
    });
  });
});

function changeVideoSpeed(speed) {
  let crossOriginError = false;

  // Change video speed in the main document
  const videos = document.querySelectorAll('video');
  if (videos.length > 0) {
    videos.forEach(video => {
      video.playbackRate = speed;
    });
  } else {
    alert("Unable to change video playback speed for videos in embedded players from other websites.");
  }
  // Attempt to change video speed in iframes
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    try {
      const iframeDoc = iframe.contentWindow.document;
      const iframeVideos = iframeDoc.querySelectorAll('video');
      iframeVideos.forEach(video => {
        video.playbackRate = speed;
      });
    } catch (e) {
      // If we hit a cross-origin error, flag it
      console.error('Unable to access iframe content:', e);
      crossOriginError = true;
    }
  });
}
