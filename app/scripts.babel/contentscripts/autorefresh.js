'use strict';

chrome.storage.local.get('options', (value) => {
    const plugin = value.options.plugins.autorefresh;
    if (plugin.active) {
        setInterval(() => {
            location.reload();
        }, plugin.interval);
    }
});