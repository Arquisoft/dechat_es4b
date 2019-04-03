Feature: Log in the chat

  Scenario Outline: Correct login 
    Given user tries to login with valid "<username>" and "<password>"
    Then login successful

  Examples:
    | username | password |
    | cuentaPruebas | monkey |