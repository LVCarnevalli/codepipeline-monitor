'use strict';

window.addEventListener('load', () => {
    const options = document.querySelector('.options');

    chrome.storage.local.get('options', (value) => {
        options.value = JSON.stringify(value.options, undefined, 4);
    });

    options.addEventListener('change', () => {
        chrome.storage.local.set({ 'options': JSON.parse(options.value) });
    });
});