Feature: Log in the chat

  Scenario Outline: Correct login 
    Given user tries to login with valid "<username>" and "<password>"
    Then login successful as "<username>"

  Examples:
    | username        | password  |
    | dechates4btest1 | 123456    |

  Scenario Outline: Wrong login 
    Given user tries to login with valid "<username>" and wrong "<password>"
    Then login fails and a error message is shown

  Examples:
    | username        | password  |
    | dechates4btest1 | fail      |