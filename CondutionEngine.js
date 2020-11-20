import dbFuncs, { setWorkspaceMode } from "./src/ObjectManager"
import pspObj from "./src/PerspectiveManager"
import dbRefObj from "./src/DBManager"


export default {start:dbRefObj.__init__, use:dbRefObj.useDb, db: dbFuncs, perspective: pspObj, flush: dbRefObj.flush, workspaceify: ()=>setWorkspaceMode(true), userlandify: ()=>setWorkspaceMode(false)};

