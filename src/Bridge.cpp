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

// # Our Packages #
#include "../lib/Task.hpp" // tasks

// clangd will fail on this line b/c it does not use standards-compilant C++11. 
// It uses 32 bit pointers in a 64 bit enviroment, which is big dumb but its
// required apparently for web. Anyways, just ignore it. Or somehow make clangd
// ignore this line. The compiler should work fine as long as you are actually
// using em++ and not AppleClang and friends.

#ifndef NO_STATIC_ASSERT
#include <emscripten/bind.h>
#endif


using namespace emscripten;


// # Bindings #
EMSCRIPTEN_BINDINGS(module) {
    function("lerp", &plusTwo);
}
