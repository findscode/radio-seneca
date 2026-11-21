# Деплой

## Клиент

- Хостинг: DigitalOcean App Platform, тип «Static Site».
- Источник: git-репозиторий. Автодеплой при пуше в основную ветку.
- Сборка: `npm run build`. Результат: папка `dist`.
- Домен клиента: `seneca.by`. Сертификат HTTPS выдаёт DigitalOcean после проверки DNS.
- Адрес: `https://seneca.by`.
- Превью: `https://seneca-kon87.ondigitalocean.app`. Приложение `seneca` в регионе `fra`, автодеплой из ветки `main`.
- DNS домена ведётся у регистратора. Для `seneca.by` нужны записи на адреса App Platform: A `162.159.140.98`, A `172.66.0.96`, AAAA `2606:4700:7::60`, AAAA `2a06:98c1:58::60`.
- Запись `radio.seneca.by` не меняется. Она указывает на радиосервер.

Названия продуктов DigitalOcean меняются. Перед настройкой проверить текущую документацию.

## Радиосервер

- Хостинг: DigitalOcean Droplet (виртуальная машина).
- Установка AzuraCast через Docker, по официальной инструкции проекта.
- AzuraCast работает отдельно от клиента.
- Домен: `radio.seneca.by`. Запись A указывает на IP Droplet.
- HTTPS: сертификат Let's Encrypt выдаёт AzuraCast. Продление идёт автоматически.
- Основной адрес AzuraCast — `https://radio.seneca.by`.
- Поток и WebSocket работают по HTTPS и WSS.

### Приоритет звука

На Droplet с 1 vCPU фоновые задачи AzuraCast отнимают процессор у Liquidsoap. Тогда Liquidsoap пишет в лог `Latency is too high: we must catchup`, и в потоке слышен треск.

Файл `/etc/cron.d/seneca-audio-priority` раз в минуту ставит всем потокам Liquidsoap и Icecast приоритет `-10`:

```
* * * * * root for p in $(pgrep -x liquidsoap) $(pgrep -x icecast); do for t in /proc/$p/task/*; do renice -n -10 -p "${t##*/}" >/dev/null 2>&1; done; done
```

`nice` в Linux действует на отдельный поток, поэтому команда обходит все потоки процесса.

### После переноса медиа

Если файлы переместили или переименовали, перезапустите вещание: `azuracast_cli azuracast:radio:restart seneca` или Restart Broadcasting в панели. Без перезапуска Liquidsoap продолжает искать старые пути и тратит процессор на ошибки `Nonexistent file`.

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
