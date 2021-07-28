const express = require("express")
const app = express()
app.use(express.json())

const cors = require("cors")
app.use(cors())

app.use("/data/", require("./routes/data-route"))

app.use("/input/", require("./routes/input-route"))

app.listen(8060, function() {
    console.log("Express server running on Port 8060...")
})
