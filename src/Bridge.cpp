#include <iostream>
#include "../lib/Task.hpp"

#include <emscripten/bind.h>
#include <SDL/SDL.h>

using namespace emscripten;

Task t;

int plusTwo(int t) {
    return t+2; 
}

const char * stringTest(const char str[]) {
    std::string stdString(str);
    t.test(stdString);
    const char * st = stdString.c_str();
    return st;
}

EMSCRIPTEN_BINDINGS(module) {
    function("lerp", &plusTwo);
}
