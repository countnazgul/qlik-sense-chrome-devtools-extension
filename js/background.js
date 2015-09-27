chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (message) {
            chrome.tabs.get(message
        , function (tabs) {
          //console.log(tabs);            
          port.postMessage(tabs.url);
            
        });
        //console.log("Message recived is  "+ message);
    });
});