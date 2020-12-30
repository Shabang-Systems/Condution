/*
 * Hello Human,
 * I am glue!
 *
 * Pour me on you,
 * and... Uh... Go see a medic?
 *
 * Bind C++ functions to JS here using 
 * EMSCRIPTEN_BINDINGS, which will make
 * functions callable on the other end
 *
 * Or expose raw ****C**** functions
 * which, if you do that, 
 * ADD IT TO THE LIST IN THE CMakeLists FILE!!
 * I will mark where to do it.
 * Also, if you do that, they need
 * to be declared in C-style. See below.
 * You can't have overloading on those ;(
 *
 * Cool cool.
 * If you want to edit the JS api, 
 * you are in the wrong place.
 * If you want to write a database hook,
 * sorry. Wrong place.
 *
 * I am the GLUE that glues the performant
 * WASM processing engine to the Emscripten
 * JS module. So. That.
 *
 * @jemoka
 *
 */ 

// # Glue-exclusive Packages # 
// Packages you exclusively need for the glue. Should be only iostream + other diag things
#include <iostream>
#include <string>
#include <stdint.h>
#include <typeinfo>

// # Our Packages #
#include "../lib/Globals.hpp" // global functions
#include "../lib/Task.hpp" // tasks

// clangd will fail on this line b/c it does not use standards-compilant C++11. 
// It uses 32 bit pointers in a 64 bit enviroment, which is big dumb but its
// required apparently for web. Anyways, just ignore it. Or somehow make clangd
// ignore this line. The compiler should work fine as long as you are actually
// using em++ and not AppleClang and friends.

#ifndef NO_STATIC_ASSERT
#include <emscripten/bind.h>
#endif

// Using WASM Toochain's namespace
using namespace emscripten;

// # Raw C Exported Function Signatures 
extern "C" {
    // # Using as Function Exports #
    //
    // Put the function definitions/signatures
    // in this section. Remember that they
    // must behave in terms of mangling
    // as C functions, meaning... ...
    //
    // 1. No pass-by-ref
    // 2. No std:: in params
    // 3. No overloading
    //
    // And this is why you should use
    // EMSCRIPTEN_BINDINGS if you can instead 
    // of doing this. After you are done, 
    // put the function as part of the exports
    // list in the CMakeLists file, but remember
    // that the function's exported name has to
    // underscore before it in the CMakeLists
    // (but not here).
    // 
    // #####################################
    //
    // # Using as Function Imports # 
    //
    //
    //
    extern int testv(int inta);
}

// # Function Definitions and Recievers #
// cRef
val docRefVal = val::global("function");
val colRefVal = val::global("function");

// # CRef Bind Functions # 
void bindDocRef(val dr) {
    docRefVal = dr;
}

void bindColRef(val cr) {
    colRefVal = cr;
}

// # DocRef Definitions # 
docRef::docRef(std::vector<std::string> p) 
    : path(p),
      docRefObject(docRefVal(p)) {}

val docRef::get() {
    val result = docRefObject["get"]().await();
    return result;
}

void docRef::set(std::map<std::string, std::string> payload, bool merge) {
    docRefObject["set"](payload, merge);
}

void docRef::set(std::map<std::string, std::string> payload) {
    docRefObject["set"](payload);
}

void docRef::update(std::map<std::string, std::string> payload) {
    docRefObject["update"](payload);
}

void docRef::remove() {
docRefObject["delete"]();
}

// # ColRef Definitions # 
colRef::colRef(std::vector<std::string> p) 
    : path(p),
      colRefObject(colRefVal(p)) {}

val colRef::add(std::map<std::string, std::string> payload) {
    return colRefObject["add"](payload).await();
}
 
// # Bindings #
EMSCRIPTEN_BINDINGS(module) {
    // Functional Bindings
    function("bindDocRef", &bindDocRef);
    function("bindColRef", &bindColRef);
}
