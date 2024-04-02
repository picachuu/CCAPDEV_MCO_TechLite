@echo off
set DB_NAME=Techlite

mongorestore --db %DB_NAME% --drop ./%DB_NAME%
pause