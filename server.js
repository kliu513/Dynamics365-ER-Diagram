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
    const url = "http://10.172.182.79:7071/api/GetPrettyGraphData?"
    const completeUrl = url + "company=" + req.query.company + "&type=" + req.query.docType + "&id=" + req.query.docID
    console.log(completeUrl)
    Axios.get(completeUrl).then(info => {res.json(info.data)})
})

app.listen(8060, function() {
    console.log("Express server running on Port 8060...")
})
