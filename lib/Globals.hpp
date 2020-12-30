#pragma once
#include <emscripten/bind.h>

using namespace emscripten;

#include <string>
#include <vector>

struct docRef {
    std::vector<std::string> path;
    val docRefObject = val::global("object");

    docRef(std::vector<std::string> p);

    val get();
    void set(std::map<std::string, std::string> payload, bool merge);
    void set(std::map<std::string, std::string> payload);
    void update(std::map<std::string, std::string> payload);
    void remove();
};

struct colRef {
    std::vector<std::string> path;
    val colRefObject = val::global("object");

    colRef(std::vector<std::string> p);

    val add(std::map<std::string, std::string> payload);
};


