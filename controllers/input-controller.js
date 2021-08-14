const fs = require("fs")

exports.inputControllerPost = (req, res) => {
    fs.writeFileSync("input.json", JSON.stringify(req.body))
}

exports.inputControllerGet = (req, res) => {
    res.json(JSON.parse(fs.readFileSync("input.json")))
}
