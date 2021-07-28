const express = require("express")
router = express.Router()
dataRoute = require("../controllers/data-controller")

router.get("/", dataRoute.dataController)

module.exports = router
