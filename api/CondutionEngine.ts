import Module from './CondutionCore';
import ReferenceManager from "./Storage/ReferenceManager";
import FirebaseProvider from "./Storage/Backends/FirebaseBackend";

require('dotenv').config();

//async function test() {
    //let manager:ReferenceManager = new ReferenceManager([new FirebaseProvider()])
    //manager.use("firebase");

    //await manager.currentProvider.authenticationProvider.authenticate({payload: {email: process.env.USERNAME, password:process.env.PASSWORD}});

    //let tasks:any = (await manager.reference("users", "TcZUcte5MFOx410Q8WJ6mRW1Pco1", "tasks").get());
//}


//test();




//function eatSaladZach() {
    //console.log("zach ate salad");
//}

//function plusOneDavid(num) {
    //return num+1;
//}

////'v': void type
////'i': 32-bit integer type
////'j': 64-bit integer type (currently does not exist in JavaScript)
////'f': 32-bit float type
////'d': 64-bit float type
//let fnPtr = Module.addFunction(eatSaladZach, "v");
//let plusOnePointer = Module.addFunction(plusOneDavid, "ii");

Module.onRuntimeInitialized = function() {
    console.log(Module.plus_two("test"));
};

export { ReferenceManager };

