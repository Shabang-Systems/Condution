import Module from "./CondutionCore";
import testv from "./test.ts";

function eatSaladZach() {
    console.log("zach ate salad");
}

let fnPtr = Module.addFunction(eatSaladZach, "v");

Module.onRuntimeInitialized = function() {
    Module.feedSalad(fnPtr);
    Module.plus_two("test");
};


