const express = require("express");
const app = express();

app.use("/data/", require("./routes/data-route"));

app.listen(8060, function() {
    console.log("Express server running on Port 8060...");
})
