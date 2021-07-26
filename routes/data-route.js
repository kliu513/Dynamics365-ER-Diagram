const express = require("express");
router = express.Router();
usersRoute = require("../controllers/data-controller");

router.get("/", usersRoute.dataController);
module.exports = router;
