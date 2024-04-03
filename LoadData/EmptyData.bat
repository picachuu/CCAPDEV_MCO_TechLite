@echo off
set DB_NAME=Techlite

mongorestore --db %DB_NAME% --drop ./Empty_Reservations/%DB_NAME%
pause