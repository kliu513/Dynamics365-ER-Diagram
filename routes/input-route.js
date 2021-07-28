const express = require("express")
router = express.Router()
inputRoute = require("../controllers/input-controller")

router.post("/", inputRoute.inputControllerPost)
router.get("/", inputRoute.inputControllerGet)

module.exports = router
