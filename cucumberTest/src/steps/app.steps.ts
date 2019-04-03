import { Before, Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import { AppPage } from '../app.po';

let page: AppPage;

Before(() => {
    page = new AppPage();
});


// Go to the login - Display the title
Given(/^I am on the login page$/,{ timeout: 5 * 1000 }, async () => {
    await page.navigateToLogin();
});
When(/^I do nothing$/, () => {});

Then(/^I should see the login title$/, async () => {
    // expect(await page.getTitleText()).to.equal('Welcome to angular-cli-cucumber-demo!');
    expect(await page.getTitleText()).to.equal('Solid Chat');
});