const assert = require('assert');
const url = 'http://127.0.0.1:8080/';

module.exports = function () {

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
                            driver.switchTo().window(mainWindow);
                        })
                    })
                })
            })
        })
    })

    this.Then(/^login successful$/, function () {
        return driver.wait(until.elementLocated(By.xpath('//*[@id="user-name"]', 5000))).then(() => {
            return driver.findElement(by.xpath('//*[@id="user-name"]'));
        })
    })

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

}