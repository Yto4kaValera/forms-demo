# Демо: сборка валидаторов и распространение статуса по дереву контролов (@angular/forms)

**Автор:** Еремина Олеся, 972403

**Библиотека:** Angular, пакет `@angular/forms`, коммит `8e376b0a82` (ветка `main`) https://github.com/angular/angular

**Механизм:** как массив валидаторов склеивается в одну функцию (`compose` / `mergeErrors`), `updateValueAndValidity` считает `errors` и `status`, пересчёт поднимается от контрола к родителю.

## Запуск
```bash
npm install
npm start                      # лог в консоли (F12) и внизу страницы
```
