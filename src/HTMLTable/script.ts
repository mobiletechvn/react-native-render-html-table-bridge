const injectedScript = `
(function () {
  var RNWV = window.ReactNativeWebView;

  // Send size on body content height updates
  function postSize() {
    var tables = document.getElementsByTagName('table');
    if (tables.length > 0) {
      var table = tables[0];
      var tableHeight = table.scrollHeight + Number(table.border) * 2;
      RNWV.postMessage(JSON.stringify({
        type: 'heightUpdate',
        content: tableHeight
      }));
    }
  }
  postSize();


  /**
   * Fix the issue on android 5: container height was not updated
   * https://github.com/jsamr/react-native-render-html-table-bridge/issues/16
   */
  setTimeout(() => postSize(), 5000);
  setTimeout(() => postSize(), 10000);


  //trigger when DOM changes
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observer = new MutationObserver(postSize);
  observer.observe(document, {
      subtree: true,
      attributes: true
  });

  // Intercept click events

  function findParent(tagname,el){
    while (el){
        if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase()){
            return el;
        }
        el = el.parentNode;
    }
    return null;
  }

  function interceptClickEvent(e) {
    var href;
    var target = e.target || e.srcElement;
    let anchor = findParent('a', target)
    if (anchor) {
        href = anchor.getAttribute('href');
        e.preventDefault();
        // Post message
        RNWV.postMessage(JSON.stringify({
          type: 'navigateEvent',
          content: href
        }));
    }
  }

  document.addEventListener('click', interceptClickEvent);
})();
`
export default injectedScript
