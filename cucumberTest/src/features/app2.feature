Feature: Go to the login
  Display the new chat button

  @loginTitle-scenario
  Scenario: Login Page
    Given I am on the login page
    When I do nothing
    Then I should see the new chat button