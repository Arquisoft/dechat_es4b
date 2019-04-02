Feature: gestion de grupos

  Scenario: Crear un primer grupo
    Given una lista de grupos vacios
    When creo un nuevo grupo
    Then el numero de grupos es 1