chrome.browserAction.onClicked.addListener(function() {
  _TabCreateOrFocus(chrome.extension.getURL("/index.html"));
});

function _TabCreateOrFocus(url) {
chrome.tabs.query({ url: url }, function(tab) {
  if (tab.length) {
    chrome.tabs.update(tab[0].id, {
      active: true
    });
  } else {
    chrome.tabs.create({
      url: url,
      active: true
    });
  }
});
}

chrome.webRequest.onBeforeSendHeaders.addListener(
function (info) {
    var headers = info.requestHeaders;
    var NewHeaders = [];
    for (let index = 0; index < headers.length; index++) {
      let item = headers[index];
      var hostname = (new URL(info.url)).hostname;
      if (item.name.toLowerCase() == 'referer' && item.value.toLowerCase().match("chrome-extension") == null) {
          item.value = "https://www.facebook.com";
      }
      if (item.name.toLowerCase() == 'origin') {
          item.value = "https://www.facebook.com";
      }
      if (item) {
          NewHeaders.push(item)
      }
    }

    let isValidReferer = headers.map(x=>x.name.toLowerCase()).indexOf("referer");
    if (!isValidReferer) {
      let refererHeaderItem = {
        value: "https://www.facebook.com",
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
        "https://*.facebook.com/*",
        "https://graph.facebook.com/*",
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
    urls: ["https://*.facebook.com/*", "https://*.messenger.com/*"]
},
);
