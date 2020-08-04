let dbFuncs = require("./src/ObjectManager");
let pspObj = require("./src/PerspectiveManager");
let dbRefObj = require("./src/DBManager");


module.exports = {start:dbRefObj.__init__, use:dbRefObj.useDb, db: dbFuncs, perspective: pspObj, flush: dbRefObj.flush};

