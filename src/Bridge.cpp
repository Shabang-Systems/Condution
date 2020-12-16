#include <iostream>

#include "../lib/Task.hpp"

    Task t;
extern "C" {
    int test();
}

int test() {
    int three = 3;
    t.test(three);
    return three;
}


