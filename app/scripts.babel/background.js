'use strict';

const options = {
  codepipeline: {
    url: 'console.aws.amazon.com/codepipeline',
    statuses: {
      succeeded: 'Succeeded',
      failed: 'Failed',
      progress: 'In Progress'
    },
    interval: 5000
  },
  plugins: {
    autologin: {
      active: false,
      user: '',
      password: '',
      interval: 60000
    },
    slackonfailure: {
      active: false,
      username: '',
      url: '',
      channel: ''
    },
    autorefresh: {
      active: false,
      interval: 300000
    }
  }
};

const monitor = 'monitor.html';

const focusOrCreateTab = (url) => {
  chrome.windows.getAll({
    'populate': true
  }, function (windows) {
    var existing_tab = null;
    for (var i in windows) {
      var tabs = windows[i].tabs;
      for (var j in tabs) {
        var tab = tabs[j];
        if (tab.url == url) {
          existing_tab = tab;
          break;
        }
      }
    }
    if (existing_tab) {
      chrome.tabs.update(existing_tab.id, {
        'selected': true
      });
    } else {
      chrome.tabs.create({
        'url': url,
        'selected': true
      });
    }
  });
}

chrome.browserAction.onClicked.addListener(function (tab) {
  focusOrCreateTab(chrome.extension.getURL(monitor));
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({
    'options': options
  });
});