#include <cstring>
#include "../lib/Task.hpp"

int Task::test(int &c) {
    c += 8;
    return c;
}

std::string* Task::test(std::string &c) {
    c[c.length()-1] = '\0';
    return &c;
}




