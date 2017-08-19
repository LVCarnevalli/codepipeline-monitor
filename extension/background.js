// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Called when the user clicks on the browser action.

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
chrome.tabs.query({currentWindow: true}, function(tabs) {
 		console.log(tabs[0]);
	    chrome.tabs.sendMessage(tabs[1].id, {
	      command: "change_title",
	      title: "hoge"
	    },
	    function(msg) {
	    	console.log("ok");
	    	console.log(msg);
	       sendResponse(msg);
});

	    });

    });


 

chrome.browserAction.onClicked.addListener(function(tab) {

 	chrome.tabs.query({currentWindow: true}, function(tabs) {
 		console.log(tabs[1]);
	    chrome.tabs.sendMessage(tabs[1].id, {
	      command: "change_title",
	      title: "hoge"
	    },
	    function(msg) {
	      console.log("result message:", msg);
	      var manager_url = chrome.extension.getURL("manager.html");
  			focusOrCreateTab(manager_url);

	    });

    });

});


function focusOrCreateTab(url) {
  chrome.windows.getAll({"populate":true}, function(windows) {
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
      chrome.tabs.update(existing_tab.id, {"selected":true});
    } else {
      chrome.tabs.create({"url":url, "selected":true});
    }
  });
}