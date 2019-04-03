Feature: Log in the chat

  Scenario Outline: Correct login 
    Given user tries to login with valid "<username>" and "<password>"
    Then login successful

  Examples:
    | username | password |
    | cuentaPruebas | monkey |

  Scenario Outline: wrong login 
    Given user tries to login with valid "<username>" and wrong "<password>"
    Then login fails and a error message is shown

  Examples:
    | username | password |
    | cuentaPruebas | fail |