Feature: gestion de chats

  Scenario: Crear un primer chat
    Given una lista de chats vacios
    When creo un nuevo chat
    Then el numero de chats es 1