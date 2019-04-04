Feature: Log in the chat

  Scenario Outline: Correct login 
    Given user tries to login with valid "<username>" and "<password>"
    Then login successful as "<username>"

  Examples:
    | username | password |
    | cuentapruebas | monkey |

  Scenario Outline: Wrong login 
    Given user tries to login with valid "<username>" and wrong "<password>"
    Then login fails and a error message is shown

  Examples:
    | username | password |
    | cuentapruebas | fail |