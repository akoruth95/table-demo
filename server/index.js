const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = 8080;
const app = express();

function csvToJson(csvFilePath) {
    
    let data = fs.readFileSync(csvFilePath, { encoding : 'utf8'});
    // Split on row
    data = data.split("\n");
    // Get first row for column headers
    const headers = data.shift().split(",");
    let json = [];    
    data.forEach((d, index) => {
        // Loop through each row
        let tmp = {}
        let row = d.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        headers.forEach((header, i) => tmp[i] = row[i]);
        // Add object to list
        json.push(tmp);
    });
    return {headers: headers, data: json};
}

const sampleDataResponse = csvToJson(path.join(__dirname, 'sample.csv'));

app.get('/sample', function (req, res) {
    res.jsonp(sampleDataResponse);
})

app.listen(PORT, function () {
    console.log("Server is running on port "+ PORT);
});