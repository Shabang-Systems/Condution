#include <iostream>
#include "../lib/Task.hpp"

int _scratch_debug() {
    Task t;
    int c = 123;
    t.test(c);
    std::cout << c << std::endl;
    return 0;
}

