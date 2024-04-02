@echo off
set DB_NAME=techlitetest
set userInfoCollection=user_infos
set userReservationCollection=user_reservations
set tier1Collection=tier1_scheds
set tier2Collection=tier2_scheds
set tier3Collection=tier3_scheds

mongoimport --db %DB_NAME% --collection %userInfoCollection% --jsonArray --file=../Techlite.user_infos.json
mongoimport --db %DB_NAME% --collection %userReservationCollection% --jsonArray --file=../Techlite.user_reservations.json
mongoimport --db %DB_NAME% --collection %tier1Collection% --jsonArray --file=../Techlite.tier1_scheds.json
mongoimport --db %DB_NAME% --collection %tier2Collection% --jsonArray --file=../Techlite.tier2_scheds.json
mongoimport --db %DB_NAME% --collection %tier3Collection% --jsonArray --file=../Techlite.tier3_scheds.json

pause