'use strict';

const AWS_CODEPIPELINE_URL = 'console.aws.amazon.com/codepipeline';

function message() {
  chrome.tabs.query({
    currentWindow: true
  }, function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.url.includes(AWS_CODEPIPELINE_URL)) {
        chrome.tabs.sendMessage(tab.id, {},
          function (msg) {
            console.log(msg);
          });
      }
    });
  });
}

setInterval(message, 3000);