const assert = require("assert");
const url = "http://127.0.0.1:8080/";

module.exports = function() {
  // FEATURE 1 Log in the chat
  // Scenario 1 Correct login

  this.Given(
    /^user tries to login with valid "([^"]*)" and "([^"]*)"$/,
    function(user, password) {
      var mainWindow = driver.getWindowHandle();

      return helpers.loadPage(url).then(() => {
        return driver
          .findElement(by.xpath('//*[@id="nav-login-btn"]'))
          .click()
          .then(() => {
            return driver
              .getAllWindowHandles()
              .then(function gotWindowHandles(allhandles) {
                driver.switchTo().window(allhandles[allhandles.length - 1]);
                return driver
                  .findElement(
                    by.xpath('//*[@id="app-container"]/div/div/button[2]')
                  )
                  .click()
                  .then(() => {
                    driver.wait(
                      until.elementsLocated(by.name("username")),
                      5000
                    );
                    driver
                      .findElement(by.xpath('//*[@id="username"]'))
                      .sendKeys(user);
                    driver
                      .findElement(by.xpath('//*[@id="password"]'))
                      .sendKeys(password);
                    driver
                      .manage()
                      .timeouts()
                      .implicitlyWait(1000);
                    return driver
                      .findElement(by.xpath('//*[@id="login"]'))
                      .click()
                      .then(() => {
                        return driver.switchTo().window(mainWindow);
                      });
                  });
              });
          });
      });
    }
  );

  this.Then(/^login successful as "([^"]*)"$/, function(username) {
    return driver
      .wait(
        until.elementLocated(
          By.xpath(
            '//*[@id="loading-gif" and @class="col-6 text-center"]',
            5000
          )
        )
      )
      .then(() => {
        driver
          .wait(
            until.elementLocated(
              By.xpath(
                '//*[@id="loading-gif" and @class="col-6 text-center hidden"]',
                10000
              )
            )
          )
          .then(() => {
            driver
              .findElement(by.xpath('//span[@id="user-name"]'))
              .getText()
              .then(function(actualname) {
                return assert.equal(actualname, username);
              });
          });
      });
  });

  // Scenario 2 Wrong login

  this.Given(
    /^user tries to login with valid "([^"]*)" and wrong "([^"]*)"$/,
    function(user, password) {
      var mainWindow = driver.getWindowHandle();

      return helpers.loadPage(url).then(() => {
        return driver
          .findElement(by.xpath('//*[@id="nav-login-btn"]'))
          .click()
          .then(() => {
            return driver
              .getAllWindowHandles()
              .then(function gotWindowHandles(allhandles) {
                driver.switchTo().window(allhandles[allhandles.length - 1]);
                return driver
                  .findElement(
                    by.xpath('//*[@id="app-container"]/div/div/button[2]')
                  )
                  .click()
                  .then(() => {
                    driver.wait(
                      until.elementsLocated(by.name("username")),
                      5000
                    );
                    driver
                      .findElement(by.xpath('//*[@id="username"]'))
                      .sendKeys(user);
                    driver
                      .findElement(by.xpath('//*[@id="password"]'))
                      .sendKeys(password);
                    driver
                      .manage()
                      .timeouts()
                      .implicitlyWait(1000);
                    return driver
                      .findElement(by.xpath('//*[@id="login"]'))
                      .click();
                  });
              });
          });
      });
    }
  );

  this.Then(/^login fails and a error message is shown$/, function() {
    return driver.findElement(by.xpath("/html/body/div/div[2]/p/strong"));
  });

  // FEATURE 2 See friends to chat
  // Scenario 1 Show list of friends

  this.Given(/^user logged with "([^"]*)" and "([^"]*)"$/, function(
    username,
    password
  ) {
    var mainWindow = driver.getWindowHandle();

    return helpers.loadPage(url).then(() => {
      return driver
        .findElement(by.xpath('//*[@id="nav-login-btn"]'))
        .click()
        .then(() => {
          return driver
            .getAllWindowHandles()
            .then(function gotWindowHandles(allhandles) {
              driver.switchTo().window(allhandles[allhandles.length - 1]);
              return driver
                .findElement(
                  by.xpath('//*[@id="app-container"]/div/div/button[2]')
                )
                .click()
                .then(() => {
                  driver.wait(until.elementsLocated(by.name("username")), 5000);
                  driver
                    .findElement(by.xpath('//*[@id="username"]'))
                    .sendKeys(username);
                  driver
                    .findElement(by.xpath('//*[@id="password"]'))
                    .sendKeys(password);
                  driver
                    .manage()
                    .timeouts()
                    .implicitlyWait(1000);
                  return driver
                    .findElement(by.xpath('//*[@id="login"]'))
                    .click()
                    .then(() => {
                      return driver.switchTo().window(mainWindow);
                    });
                });
            });
        });
    });
  });

  this.When(/^user clicks on "([^"]*)"$/, function(param) {
    driver
      .wait(
        until.elementsLocated(by.xpath('//*[@id="new-chat-options"]')),
        5000
      )
      .then(() => {
        return sleep(400).then(() => {
          return driver.findElement(by.xpath('//*[@id="new-btn"]')).click();
        });
      });
  });

  this.Then(/^"([^"]*)" appers in partner selector menu$/, function(friend) {
    return driver
      .findElement(by.xpath('//*[@id="possible-people"]'))
      .getText()
      .then(function(actualFriend) {
        return assert.equal(actualFriend, friend);
      });
  });

  function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  // FEATURE 3 Send messages
  // Scenario 1 Send one message

  this.Then(/^sends a "([^"]*)"$/, function(message) {
    return driver
      .findElement(by.xpath('//*[@id="possible-people"]/option'))
      .click()
      .then(() => {
        return driver
          .findElement(by.xpath('//*[@id="data-name"]'))
          .sendKeys(message)
          .then(() => {
            return driver
              .findElement(by.xpath('//*[@class="msg_send_btn"]'))
              .click();
          });
      });
  });

  this.Then(/^new "([^"]*)" appears on the chat$/, function(message) {
    return driver
      .wait(until.elementsLocated(by.xpath('//*[@id="userName"]')), 13000)
      .then(() => {
        driver
          .findElement(By.xpath('//*[@id="addOurMessages"]/p'))
          .getText()
          .then(function(actualMessage) {
            return assert.equal(actualMessage, message);
          });
      });
  });
};
