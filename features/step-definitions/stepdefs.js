const assert = require('assert');
const url = 'http://127.0.0.1:8080/';

module.exports = function () {

    // FEATURE 1 Log in the chat
    // Scenario 1 Correct login

    this.Given(/^user tries to login with valid "([^"]*)" and "([^"]*)"$/, function (user, password) {
        var mainWindow = driver.getWindowHandle();

        return helpers.loadPage(url).then(() => {
            return driver.findElement(by.xpath('//*[@id="nav-login-btn"]')).click().then(() => {
                return driver.getAllWindowHandles().then(function gotWindowHandles(allhandles) {
                    driver.switchTo().window(allhandles[allhandles.length - 1]);
                    return driver.findElement(by.xpath('//*[@id="app-container"]/div/div/button[2]')).click().then(() => {
                        driver.wait(until.elementsLocated(by.name("username")), 5000);
                        driver.findElement(by.xpath('//*[@id="username"]')).sendKeys(user);
                        driver.findElement(by.xpath('//*[@id="password"]')).sendKeys(password);
                        driver.manage().timeouts().implicitlyWait(1000);
                        return driver.findElement(by.xpath('//*[@id="login"]')).click().then(() => {
                            return driver.switchTo().window(mainWindow);
                        })
                    })
                })
            })
        })
    })

    this.Then(/^login successful as "([^"]*)"$/, function (username) {
        return driver.wait(until.elementLocated(By.xpath('//*[@id="user-name"]', 5000))).then(() => {
            driver.findElement(by.xpath('//*[@id="user-name"]')).getText().then(function (actualname) {
                return assert.equal(actualname, username);
            })

        })
    })

    // Scenario 2 Wrong login

    this.Given(/^user tries to login with valid "([^"]*)" and wrong "([^"]*)"$/, function (user, password) {
        var mainWindow = driver.getWindowHandle();

        return helpers.loadPage(url).then(() => {
            return driver.findElement(by.xpath('//*[@id="nav-login-btn"]')).click().then(() => {
                return driver.getAllWindowHandles().then(function gotWindowHandles(allhandles) {
                    driver.switchTo().window(allhandles[allhandles.length - 1]);
                    return driver.findElement(by.xpath('//*[@id="app-container"]/div/div/button[2]')).click().then(() => {
                        driver.wait(until.elementsLocated(by.name("username")), 5000);
                        driver.findElement(by.xpath('//*[@id="username"]')).sendKeys(user);
                        driver.findElement(by.xpath('//*[@id="password"]')).sendKeys(password);
                        driver.manage().timeouts().implicitlyWait(1000);
                        return driver.findElement(by.xpath('//*[@id="login"]')).click();
                    })
                })
            })
        })
    });

    this.Then(/^login fails and a error message is shown$/, function () {
        return driver.findElement(by.xpath('/html/body/div/div[2]/p/strong'));
    });

    // FEATURE 2 See friends to chat
    // Scenario 1 Show list of friends

    this.Given(/^user logged with "([^"]*)" and "([^"]*)"$/, function (username, password) {
        var mainWindow = driver.getWindowHandle();

        return helpers.loadPage(url).then(() => {
            return driver.findElement(by.xpath('//*[@id="nav-login-btn"]')).click().then(() => {
                return driver.getAllWindowHandles().then(function gotWindowHandles(allhandles) {
                    driver.switchTo().window(allhandles[allhandles.length - 1]);
                    return driver.findElement(by.xpath('//*[@id="app-container"]/div/div/button[2]')).click().then(() => {
                        driver.wait(until.elementsLocated(by.name("username")), 5000);
                        driver.findElement(by.xpath('//*[@id="username"]')).sendKeys(username);
                        driver.findElement(by.xpath('//*[@id="password"]')).sendKeys(password);
                        driver.manage().timeouts().implicitlyWait(1000);
                        return driver.findElement(by.xpath('//*[@id="login"]')).click().then(() => {
                            return driver.switchTo().window(mainWindow);
                        })
                    })
                })
            })
        })
    });


    this.When(/^user clicks on "([^"]*)"$/, function (param) {
        driver.wait(until.elementsLocated(by.xpath('//*[@id="possible-people"]')), 5000).then(() => {
            return driver.findElement(by.xpath('//*[@id="new-btn"]')).click()
        })
    })

    this.Then(/^"([^"]*)" appers in partner selector menu$/, function (friend) {
        return driver.findElement(by.xpath('//*[@id="possible-people"]')).getText().then(function (actualFriend) {
            return assert.equal(actualFriend, friend);
        })
    });

}