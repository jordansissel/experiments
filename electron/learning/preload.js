
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
    for (const dependency of ['chrome', 'node', 'electron']) { replaceText(`${dependency}-version`, process.versions[dependency]) }
})

const { contextBridge } = require('electron')
contextBridge.exposeInMainWorld('myAPI', {  doAThing: () => { console.log("OK")}})