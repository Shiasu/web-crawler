const fs = require("fs");
const { Parser } = require("json2csv");

const data = JSON.parse(fs.readFileSync("result.json", "utf-8"));
console.log(data);

const json2csvParser = new Parser();
const csv = json2csvParser.parse();
console.log(csv);