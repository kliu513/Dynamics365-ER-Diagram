const fs = require("fs")

const fd = fs.openSync("input.json", 'w')

exports.inputControllerPost = (req, res) => {
    let input = req.body
    console.log(input)
    fs.writeSync(fd, JSON.stringify(input))
    fs.closeSync(fd)
}

exports.inputControllerGet = (req, res) => {
    res.json(JSON.parse(fs.readFileSync("input.json")))
}
