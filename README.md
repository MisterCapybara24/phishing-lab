# IITU Phishing Lab — GitHub Pages

Красный интерфейс лаборатории с выбором шрифта, статистикой PhiUSIIL, реальными результатами Logistic Regression и Random Forest и проверкой ссылок в браузере.

## Публикация

Создайте пустой репозиторий GitHub `phishing-lab`, загрузите содержимое этой папки в ветку `main`, включая `.github/workflows/pages.yml`. В Settings → Pages выберите Source → GitHub Actions. После успешного workflow сайт будет доступен по адресу `https://ВАШ-ЛОГИН.github.io/phishing-lab/`.

Можно также выбрать Deploy from a branch → main → /(root). Папка содержит `.nojekyll` и не требует сборки.

## Как работает

Модели экспортированы из локального scikit-learn без переобучения. Logistic Regression использует исходные параметры StandardScaler, коэффициенты и свободный член. Random Forest усредняет вероятности листьев 120 деревьев и использует float32 на входе, как scikit-learn. URL не отправляется на сервер и не открывается. Public Suffix List взят из того же снимка tldextract, включая private domains. Необычные сокращённые IPv4 и обратные слеши отклоняются из-за различий парсеров JavaScript и Python.

Повторное обучение, Mastra workflow и AI-чат доступны только в локальной Python/Node.js версии. Страница публикует результаты уже выполненного обучения, не имитирует новый запуск.

## Источники и ограничения

Данные: Prasad & Chandra (2024), PhiUSIIL Phishing URL Dataset, UCI, CC BY 4.0: https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset

Public Suffix List: https://publicsuffix.org/list/ — Mozilla Public License 2.0. `suffixes.json` представляет список правил из снимка tldextract. Логотип IITU предоставлен пользователем. Учебный проект не является официальным сервисом университета.

Высокие метрики относятся только к тестовой выборке. В данных есть смещение: все легитимные примеры используют HTTPS и имеют 3 специальных символа. Модель может ошибаться на безопасных адресах. Содержимое страниц и репутация домена не проверяются.
