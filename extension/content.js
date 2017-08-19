chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  sendResponse(document.getElementById("preconfig-blank").outerText);
});