set(project "CondutionCore")

project(${project})
cmake_minimum_required(VERSION 3.12)

# source list
file(GLOB_RECURSE sources "src/*.cpp" "lib/*.hpp")

# specify the executable
add_executable(${project} ${sources}) # Bridge goes first
target_include_directories(${project} PUBLIC "lib")
set(EXECUTABLE_OUTPUT_PATH "api")

# Raw **C** API exposures to JS. Need to use `extern "C"` on these
# and they may not call any functions that utilize mangled C++ code
set(exports 
    _test
    # anything and everything
 )

# process exported functions
set(exports_string "")
list(JOIN exports "," exports_string)

# set compiler and flags

set_target_properties(${project} PROPERTIES LINK_FLAGS "-s WASM=1 -s EXPORTED_FUNCTIONS='[${exports_string}]' -s EXTRA_EXPORTED_RUNTIME_METHODS='[ccall, cwrap]'")


