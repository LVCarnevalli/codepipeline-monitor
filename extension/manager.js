function message() {
	chrome.tabs.query({currentWindow: true}, function(tabs) {
 		console.log(tabs[1]);
	    chrome.tabs.sendMessage(tabs[1].id, {
	      command: "change_title",
	      title: "hoge"
	    },
	    function(msg) {
	      console.log("result message:", msg);
	      

	    });

    });
}

setInterval(message, 3000);


document.addEventListener('DOMContentLoaded', function() {
	 document.getElementById("teste").addEventListener('click', message);
  });