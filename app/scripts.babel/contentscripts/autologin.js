'use strict';

const awsPage = {
    loginButton() {
        return document.querySelector('#signin_button');
    },
    usernameInput() {
        return document.querySelector('#username');
    },
    passwordInput() {
        return document.querySelector('#password');
    }
};

chrome.storage.local.get('options', (value) => {
    const plugin = value.options.plugins.autologin;
    if (plugin.active) {
        setInterval(() => {
            const usernameInput = awsPage.usernameInput();
            const passwordInput = awsPage.passwordInput();
            const loginButton = awsPage.loginButton();
            if (usernameInput && passwordInput && loginButton) {
                usernameInput.value = plugin.user;
                passwordInput.value = plugin.password;
                loginButton.click();
            }
        }, plugin.interval);
    }
});