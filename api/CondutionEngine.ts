import Module from "./CondutionCore";
import ReferenceManager from "./Storage/ReferenceManager";


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

//Module.onRuntimeInitialized = function() {
    //Module.feedSalad(fnPtr);
    //Module.feedEmacs(plusOnePointer);
    //Module.plus_two("test");
//};

export { ReferenceManager };

