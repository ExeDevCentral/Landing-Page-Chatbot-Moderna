@echo off
setlocal ENABLEEXTENSIONS
title Arrancar Proyecto

REM Moverse al directorio del script
cd /d %~dp0

echo Creando carpeta de datos para MongoDB...
mkdir "data\mongo" >nul 2>&1

echo ======================================
echo =           Iniciando MongoDB        =
echo ======================================
REM Intentar con Docker primero
where docker >nul 2>&1
if %ERRORLEVEL%==0 (
  for /f "usebackq tokens=*" %%i in (`docker ps -aq -f "name=lp-mongo"`) do set MONGO_ID=%%i
  if not defined MONGO_ID (
    echo No existe contenedor lp-mongo. Creandolo...
    docker run -d --name lp-mongo -p 27017:27017 -v "%CD%\data\mongo:/data/db" mongo:6 >nul 2>&1
    if %ERRORLEVEL%==0 (
      echo MongoDB ^(docker^) iniciado.
    ) else (
      echo No se pudo crear el contenedor de MongoDB con Docker.
    )
  ) else (
  for /f "usebackq tokens=*" %%s in (`docker ps -q -f "name=lp-mongo"`) do set MONGO_RUNNING=%%s
    if not defined MONGO_RUNNING (
      echo Iniciando contenedor lp-mongo...
      docker start lp-mongo >nul 2>&1
      if %ERRORLEVEL%==0 (
      echo MongoDB ^(docker^) iniciado.
      ) else (
        echo No se pudo iniciar el contenedor de MongoDB con Docker.
      )
    ) else (
      echo MongoDB ^(docker^) ya esta ejecutandose.
    )
  )
) else (
  echo Docker no encontrado. Intentando iniciar mongod local...
  where mongod >nul 2>&1
  if %ERRORLEVEL%==0 (
    start "MongoDB" cmd /k mongod --dbpath "%CD%\data\mongo"
    echo mongod iniciado en una ventana separada.
  ) else (
    echo No se encontro Docker ni mongod en PATH. Inicia MongoDB manualmente.
  )
)

echo.
echo.
echo Esperando 10 segundos para que la base de datos inicie...
timeout /t 10 /nobreak >nul
echo.
echo ======================================
echo =           Iniciando Backend        =
echo ======================================
REM Levantar el backend con nodemon
start "Backend" cmd /k npm run dev

echo.
echo Listo. El backend se abrio en otra ventana. Si usaste Docker, Mongo esta en el contenedor lp-mongo.

endlocal
exit /b 0
