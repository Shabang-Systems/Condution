import dbFuncs, { setWorkspaceMode } from "./src/legacy/ObjectManager.js"
import pspObj from "./src/legacy/PerspectiveManager.js"
import dbRefObj from "./src/legacy/DBManager.js"


export default {start:dbRefObj.__init__, use:dbRefObj.useDb, db: dbFuncs, perspective: pspObj, flush: dbRefObj.flush, workspaceify: ()=>setWorkspaceMode(true), userlandify: ()=>setWorkspaceMode(false)};

