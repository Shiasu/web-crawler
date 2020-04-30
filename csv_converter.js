const fs = require("fs");
const converter = require('json-2-csv');


const myObj = JSON.parse(fs.readFileSync("result.json", "utf-8"));

let json2csvCallback = function (err, csv) {
	csvWithBom = "\uFEFF" + csv;
    if (err) throw err;
    fs.writeFile("result.csv", csvWithBom, "utf8", function(err) {
      if (err) {
        console.log("Some error occured - file either not saved or corrupted file saved.");
      } else {
        console.log("It\'s saved");
      }
    });
};

converter.json2csv(myObj, json2csvCallback, {
  prependHeader: true
});