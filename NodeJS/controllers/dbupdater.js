function add(server,modules){
    // establish all module constants
    const dbmodel = modules.dbmodel;
    const tier1_schedModel = dbmodel.tier1_schedModel;
    const tier2_schedModel = dbmodel.tier2_schedModel;
    const tier3_schedModel = dbmodel.tier3_schedModel;
    const errorFn = dbmodel.errorFn;

    const deletePastAvailable = true;

    // Executes as the server starts
    checkOldDate().catch(console.error);
    checkDateTime();
    // checkDatabase(); // might conflict with checkDateTime if both are called at the same time

    // Call checkDateTime every minute (60000 milliseconds)
    setInterval(checkDateTime, 1000*60);
    // Call checkOldDate every 24 hours (86400000 milliseconds)
    setInterval(() => {
        if (deletePastAvailable) checkOldDate().catch(console.error);
    }, 1000*60*60*24);
    // Call checkDatabase every 10 minutes (600000 milliseconds)
    setInterval(checkDatabase, 1000*60*10);

    async function createNewDay (year, month, day) {
        const seatCount = 15;
        const tiers = 3;
        // 30 minute time intervals
        const timeSlots = 48; // per seat day
        const totalTierSlots = seatCount * timeSlots; // per tier day = 15 * 48 = 720
        const totalSlots = totalTierSlots * tiers; // per day = 15 * 48 * 3 = 2160

        const tierModels = [tier1_schedModel, tier2_schedModel, tier3_schedModel];

        // create an array of time_starts
        let timeStarts = [];
        for (let i = 0; i < timeSlots; i++) {
            let hour = Math.floor(i / 2);
            let minute = (i % 2) * 30;
            let timeStart = hour * 100 + minute;
            timeStarts.push(timeStart);
        }

        let docCount = 0;

        // the constants: year, month, day, reservation_id = null, cancelled_by = null, assigned_to = null, email = null, taken = false
        // variables: tier_num, seat_num, time_start(time_end)
        // outer loop: tiers
        for (let tierNum = 1; tierNum <= tiers; tierNum++) {
            // middle loop: seats
            for (let seatNum = 1; seatNum <= seatCount; seatNum++) {
                // inner loop: time_starts for each
                timeStarts.forEach(async function(timeStart) {
                    // create a new day (document) for the seat of the tiernum using the tiermodel
                    //time_end is timeStart + 30 minutes, but + 70 when timeStart%100 = 30
                    const timeEnd = timeStart + (timeStart % 100 === 30 ? 70 : 30);
                    let newDoc = new tierModels[tierNum - 1]({
                        seats: seatNum,
                        reservation_id: null,
                        cancelled_by: null,
                        time_start: timeStart,
                        time_end: timeEnd,
                        assigned_to: null,
                        email: null,
                        taken: false,
                        month: month,
                        day: day,
                        year: year
                    });
                    // save the new document
                    try {
                        await newDoc.save();
                        docCount++;
                    } catch (error) {
                        errorFn(error);
                    }
                });
            }
        }
    }

    // checks the collection per day interval (today, tomorrow, and the day after tomorrow)
    async function checkDate(year, month, day) {
        // get all the time slots for the day throughout all the tier collections
        // map each model to the corresponding tier number (for loop)
        const tierModels = [tier1_schedModel, tier2_schedModel, tier3_schedModel];

        // if lengthCount = 0, then create a new day using createNewDay() function
        let lengthCount = 0;
        for (let i = 0; i < tierModels.length; i++) {
            await tierModels[i].find({year: year, month: month, day: day}).lean().then(function(slots) {
                lengthCount += slots.length;
            });
        }

        console.log('Total slots found:', lengthCount, 'for', year, month, day);

        if (lengthCount === 0) {
            console.log('Creating new day timeslots for:', year, month, day);
            createNewDay(year, month, day);
        }
    }

    // checks the collection per day interval (today, tomorrow, and the day after tomorrow)
    function checkDateTime() {
        const currentDateTime = new Date();
        console.log('Current date and time:', currentDateTime);

        // get check the date from currentDateTime and the next 2 days
        for (let i = 0; i < 3; i++) {
            let date = new Date(currentDateTime);
            date.setDate(date.getDate() + i);
            
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
        
            checkDate(year, month, day);
        }
    }
    

    

    // checks the integrity of the database of the date and time slots, and creates when there are supposed slots missing
    // prolly not gonna implement this
    function checkDatabase() {
        const currentDateTime = new Date();
        console.log('Checking database at:', currentDateTime);

        let count = 0;

        // steps similar to checkDateTime
        
        // get count from currentDateTime and the next 2 days
        for (let i = 0; i < 3; i++) {
            let date = new Date(currentDateTime);
            date.setDate(date.getDate() + i);
            
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
        
            checkDocDay(year, month, day);
        }
    }

    async function checkDocDay(year, month, day) {

        const seatCount = 15;
        const tiers = 3;
        // 30 minute time intervals
        const timeSlots = 48; // per seat day
        const totalTierSlots = seatCount * timeSlots; // per tier day = 15 * 48 = 720
        const totalSlots = totalTierSlots * tiers; // per day = 15 * 48 * 3 = 2160

        const tierModels = [tier1_schedModel, tier2_schedModel, tier3_schedModel];

        // create an array of time_starts
        let timeStarts = [];
        for (let i = 0; i < timeSlots; i++) {
            let hour = Math.floor(i / 2);
            let minute = (i % 2) * 30;
            let timeStart = hour * 100 + minute;
            timeStarts.push(timeStart);
        }

        let allInvalidDocsArray = [];
        let validatedDocsArray = [];
        let invalidDocsArray = [];
        let missingDocsArray = [];
        let deletedDocsArray = [];
        let createdDocsArray = [];
        

        // the constants: year, month, day, reservation_id = null, cancelled_by = null, assigned_to = null, email = null, taken = false
        // variables: tier_num, seat_num, time_start(time_end)
        // outer loop: tiers
        for (let tierNum = 1; tierNum <= tiers; tierNum++) {
            let allValidDocuments = [];
            let validatedDocs = 0;
            let invalidDocs = 0;
            let missingDocs = 0;
            let deletedDocs = 0;
            let createdDocs = 0;

            // middle loop: seats
            for (let seatNum = 1; seatNum <= seatCount; seatNum++) {
                // inner loop: time_starts for each
                timeStarts.forEach(async function(timeStart) {
                    // create a new day (document) for the seat of the tiernum using the tiermodel
                    //time_end is timeStart + 30 minutes, but + 70 when timeStart%100 = 30
                    const timeEnd = timeStart + (timeStart % 100 === 30 ? 70 : 30);
                    let searchQuery = {
                        seats: seatNum,
                        time_start: timeStart,
                        month: month,
                        day: day,
                        year: year,
                        cancelled_by: null
                    };

                    let doc = await tierModels[tierNum - 1].findOne(searchQuery).lean();
                    if (doc) {
                        allValidDocuments.push(doc);
                        validatedDocs++;
                    } else { //create the respective supposed document
                        let newDoc = new tierModels[tierNum - 1]({
                            seats: seatNum,
                            reservation_id: null,
                            cancelled_by: null,
                            time_start: timeStart,
                            time_end: timeEnd,
                            assigned_to: null,
                            email: null,
                            taken: false,
                            month: month,
                            day: day,
                            year: year
                        });
                        // save the new document
                        missingDocs++;
                        createdDocs++;
                        // validatedDocs++;
                        try {
                            const savedDoc = await newDoc.save();
                            allValidDocuments.push(savedDoc);
                        } catch (error) {
                            errorFn(error);
                        }
                    }
                });
            }

            // check if there are any invalid documents by searching for documents that are not in allValidDocuments using (_id, except when cancelled_by != null)
            let allDocs = await tierModels[tierNum - 1].find({year: year, month: month, day: day}).lean();
            allDocs.forEach(function(doc) {
                let found = false;
                for (let i = 0; i < allValidDocuments.length; i++) {
                    if (doc._id.equals(allValidDocuments[i]._id)) {
                        found = true;
                        break;
                    }
                }
                if (!found && doc.cancelled_by === null) {
                    allInvalidDocsArray.push(doc);
                    // delete the document
                    tierModels[tierNum - 1].deleteOne({_id: doc._id}).catch(errorFn);
                    deletedDocs++;
                    invalidDocs++;
                }
            });

            createdDocsArray.push(createdDocs);
            deletedDocsArray.push(deletedDocs);
            validatedDocsArray.push(validatedDocs);
            invalidDocsArray.push(invalidDocs);
            missingDocsArray.push(missingDocs);
        }

        console.log('---Date:', year, month, day);
        // console.log forloop
        for (let i = 0; i < tiers; i++) {
            console.log('Tier:', i+1,' - ', validatedDocsArray[i], 'validated documents,', invalidDocsArray[i], 'invalid documents,', missingDocsArray[i], 'missing documents');
            console.log('Tier:', i+1,' - ', createdDocsArray[i], 'created documents,', deletedDocsArray[i], 'deleted documents');
        }

        // show invalid docs
        console.log('Invalid documents:', allInvalidDocsArray);
    }

    async function checkOldDate() {
        // get the current date
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Months are 0-based in JavaScript
        const currentDay = currentDate.getDate();
    
        console.log('Checking old dates at:', currentDate);
    
        const tierModels = [tier1_schedModel, tier2_schedModel, tier3_schedModel];

        for (let i = 0; i < tierModels.length; i++) {
            try {
                // Delete all documents with a date before the current date and where taken is false
                const result = await tierModels[i].deleteMany({
                    taken: false,
                    $or: [
                        { year: { $lt: currentYear } },
                        { year: currentYear, month: { $lt: currentMonth } },
                        { year: currentYear, month: currentMonth, day: { $lt: currentDay } }
                    ]
                });
        
                console.log("Tier:", i+1," - ", result.deletedCount, 'documents were deleted');
            } catch (err) {
                console.error(err);
            }
        }

        
    }


  
  }
  
  module.exports.add = add;