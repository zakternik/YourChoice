@echo off

REM Ustavljam in odstranjujem vse kontejnerje
docker compose down

REM Gradim Docker sliko
docker build -t your_choice_backend_image .

REM Start containers in detached mode
docker compose up -d