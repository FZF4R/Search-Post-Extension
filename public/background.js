chrome.action.onClicked.addListener(function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});

chrome.webRequest.onBeforeSendHeaders.addListener(
function (info) {
    var headers = info.requestHeaders;
    var NewHeaders = [];
    for (let index = 0; index < headers.length; index++) {
      let item = headers[index];
      var hostname = (new URL(info.url)).hostname;
      if (item.name.toLowerCase() == 'referer' && item.value.toLowerCase().match("chrome-extension") == null) {
          item.value = "https://www.arbeitsagentur.de";
      }
      if (item.name.toLowerCase() == 'origin') {
          item.value = "https://www.arbeitsagentur.de";
      }
      if (item) {
          NewHeaders.push(item)
      }
    }

    let isValidReferer = headers.map(x=>x.name.toLowerCase()).indexOf("referer");
    if (!isValidReferer) {
      let refererHeaderItem = {
        value: "https://www.arbeitsagentur.de",
        name: "Referer"
      }

      NewHeaders.push(refererHeaderItem);
    }

    if (NewHeaders.length > 0) {
        return { requestHeaders: NewHeaders };
    }
},
{
    urls: [
        "https://*.arbeitsagentur.de/*",
        "https://arbeitsagentur.de/*",
    ],
    types: ["main_frame", "sub_frame", "xmlhttprequest"]
}, ["blocking", "requestHeaders", "extraHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
function (details) {
    var hostname = new URL(details.url).hostname;
    if (details.url.match(".facebook.com") !== null) {
        var hostname = new URL(details.url).hostname;
        //console.log(details.responseHeaders);
        if (details.responseHeaders && details.responseHeaders.length > 0) {
          for (var i = 0; i < details.responseHeaders.length; ++i) {
              var j = details.responseHeaders[i];
              if (details.responseHeaders[i].name.toLowerCase() == "access-control-allow-origin") {
                  details.responseHeaders[i].value = "*";
              }
              if (details.responseHeaders[i].name.toLowerCase() == "access-control-allow-headers") {
                  details.responseHeaders[i].value = 'Content-Type';
              }
          }
        }
    }
    return { responseHeaders: details.responseHeaders };
},
{
    urls: ["https://*.arbeitsagentur.de/*", "https://*.arbeitsagentur.de/*"]
},
);
