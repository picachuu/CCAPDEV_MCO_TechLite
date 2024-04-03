@echo off
set DB_NAME=Techlite

mongorestore --db %DB_NAME% --drop ./Test_dump/%DB_NAME%
pause