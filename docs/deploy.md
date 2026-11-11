# Деплой

## Клиент

- Хостинг: DigitalOcean App Platform, тип «Static Site».
- Источник: git-репозиторий. Автодеплой при пуше в основную ветку.
- Сборка: `npm run build`. Результат: папка `dist`.
- Домен и HTTPS: собственный домен с сертификатом, который выдаёт DigitalOcean.
- Превью с `0.1.0`: приложение `seneca` в регионе `fra`, автодеплой из ветки `main`.
- Адрес превью: `https://seneca-kon87.ondigitalocean.app`.

Названия продуктов DigitalOcean меняются. Перед настройкой проверить текущую документацию.

## Радиосервер

- Хостинг: DigitalOcean Droplet (виртуальная машина).
- Установка AzuraCast через Docker, по официальной инструкции проекта.
- AzuraCast работает отдельно от клиента.
- Домен: `radio.seneca.by`. Запись A указывает на IP Droplet.
- HTTPS: сертификат Let's Encrypt выдаёт AzuraCast. Продление идёт автоматически.
- Основной адрес AzuraCast — `https://radio.seneca.by`.
- Поток и WebSocket работают по HTTPS и WSS.

## Переменные сборки

- Адрес радиосервера (для `nowplaying` и WebSocket).
- `VITE_STREAM_URL` — адрес потока Icecast: `https://radio.seneca.by/listen/seneca/radio.mp3`.
- `VITE_NOWPLAYING_URL` — адрес `nowplaying`: `https://radio.seneca.by/api/nowplaying/seneca`.
- `VITE_NOWPLAYING_WS_URL` — адрес WebSocket: `wss://radio.seneca.by/api/live/nowplaying/websocket`.
- `VITE_STATION_SHORTCODE` — короткий код станции.
- Значения задаются при сборке и в репозиторий не кладутся.
- Переменные Vite начинаются с `VITE_`.
- Секреты в клиент не кладём. Клиент публичный.

## Требования

- Поток и радиосервер отдаём по HTTPS. Иначе браузер заблокирует звук на HTTPS-странице.
- WebSocket радиосервера тоже по защищённому соединению (`wss://`).

## Релиз

- Версия по [версионированию](versioning.md) получает git-тег `vX.Y.Z`.
- Деплой из основной ветки. Тег отмечает релиз в журнале.
