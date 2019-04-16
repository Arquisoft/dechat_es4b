Feature: See friends to chat

  Scenario Outline: Show list of friends
    Given user logged with "<username>" and "<password>"
    When user clicks on "New chat"
    Then "<friend>" appers in partner selector menu

  Examples:
    | username        | password  | friend          |
    | dechates4btest1 | 123456    | dechates4btest2 |