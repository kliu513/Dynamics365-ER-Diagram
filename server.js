const express = require("express")
const app = express()
app.use(express.json())

const cors = require("cors")
app.use(cors())

const Axios = require("axios")

app.use("/data/", require("./routes/data-route"))

app.use("/input/", require("./routes/input-route"))

app.use("/output/", require("./routes/output-route"))

app.get("/request/", (req, res) => {
    Axios.get("http://10.172.182.79:7071/api/GetGraphData?company=usmf&type=invoice&id=itest-combine").then(info => {
        res.json(info.data)
        })
})

app.listen(8060, function() {
    console.log("Express server running on Port 8060...")
})
