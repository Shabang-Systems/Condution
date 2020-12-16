#include <iostream>
#include "../lib/Task.hpp"

extern "C" {
    Task t;
    int not_scratch();
    int scratch_debug();

    int not_scratch() {
        int c = 123;
        t.test(c);
        std::string str("this is a test");
        t.test(str);
        return c;
    }

    int scratch_debug() {
        std::cout << not_scratch() << std::endl;
        return 0;
    }

}
