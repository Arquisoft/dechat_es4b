Feature: send a message to a friend

  Scenario Outline: send one message to friend
    Given user logged with "<username>" and "<password>"
    When user clicks on "New chat"
    And "<friend>" appers in partner selector menu
    Then sends a "<message>"
    Then new "<message>" appears on the chat
    
  Examples:
    | username        | password  | friend          | message       |
    | dechates4btest1 | 123456    | dechates4btest2 | Hi test user  |