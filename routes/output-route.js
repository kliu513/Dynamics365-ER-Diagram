const express = require("express")
router = express.Router()
dataRoute = require("../controllers/output-controller")

router.get("/", dataRoute.outputController)

module.exports = router
