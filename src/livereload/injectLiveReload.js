const scriptEl = document.createElement('script')
scriptEl.src = "http://localhost:9000/injectTab.js?u=" + Math.random() * 9999
document.body.appendChild(scriptEl)

const styleEl = document.createElement('link')
styleEl.rel = "stylesheet"
styleEl.href = "http://localhost:9000/injectTab.css?u=" + Math.random() * 9999
document.head.insertBefore(styleEl, document.head.childNodes[document.head.childNodes.length])