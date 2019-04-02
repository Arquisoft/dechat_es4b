Feature: Log in the chat

  Scenario: Correct login 
    Given user tries to login with valid "<username>" and "<password>"
    Then login successful

  Examples:
    | user | password |
    | cuentaPruebas | testSolid13 |