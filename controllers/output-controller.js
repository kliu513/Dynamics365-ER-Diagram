const fs = require("fs")

exports.outputController = (req, res) => {
    res.json(JSON.parse(fs.readFileSync("output.json")))
} 
