import { browser, by, element } from 'protractor';

export class AppPage {
    navigateToLogin() {
        return browser.get('/index');
    }
    navigateToCard () {
        return browser.get('/card');
    }

    getTitleText() {
       // return element(by.css('app-root title')).getText();
        return element(by.css('title')).getText();
    }
    getDescriptionLogin() {
        return element(by.css('h2')).getText();
    }
}