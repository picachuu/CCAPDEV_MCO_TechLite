@echo off
set DB_NAME=Techlite
set OUTPUT_DIR=./

mongodump --db %DB_NAME% --out %OUTPUT_DIR%
pause