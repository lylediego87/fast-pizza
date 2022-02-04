require('colors');

const xlsx = require('node-xlsx');
const { MongoClient } = require('mongodb');
const { getJsDateFromExcel } = require("excel-date-to-js");
const client = new MongoClient("mongodb://root:password123@mongodb:27017");

const main = async () => {
  await client.connect();
  console.log('Connected successfully to server'.cyan);
  const db = client.db("fastpizzadb");
  const collection = db.collection("drivers");     
  console.log('[ok] Reading Excel file...Please be patient as we are processing many records'.cyan);
  const workSheetsFromFile = xlsx.parse('./transjakarta_gps.xlsx');

  const insertIntoDb = async (data) => {   
    await collection.insertMany(data);    
  }

   workSheetsFromFile.forEach(async (ws) => {
     console.log('[ok] Processing rows..'.cyan);
     const mapped = ws.data
       .filter(x => x[0] !=  'Driver_code') // Filter out header row
       .map(x => ({
         driverId : x[0],
         date: getJsDateFromExcel(x[2]),
         longitude: x[6],
         latitude: x[7]
       })).sort((a,b) => a.date - b.date);
    
     while(mapped.length != 0){
       var bulk = mapped.splice(0, 5000);
       if(mapped.length < 5000){
         lastRecords = mapped.splice(0, mapped.length);
         console.log(`[ok] Last Records ${mapped.length}`.cyan);
         await insertIntoDb(lastRecords);
       }

       await insertIntoDb(bulk);
       console.log(`[ok] Remaining Records ${mapped.length}`.cyan);
     }
    client.close();
    console.log(`[ok] Data imported succesfully from xlsx file to mongo db container`.cyan);
  });  
}


main();