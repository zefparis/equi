@echo off
echo Testing Docker build locally...

REM Build the Docker image
docker build -t equi-saddles-test .

if %ERRORLEVEL% == 0 (
    echo Docker build successful!
    echo Starting container...
    docker run -p 8080:8080 -e PORT=8080 equi-saddles-test
) else (
    echo Docker build failed!
    exit /b 1
)
