# Hello Human
# This is a CMakeList.
# 
# Its used by the build command.
# You probably came here to expose
# A raw C function. 
# 
# If you don't know what extern "C" means
# Turn back. Read src/Bridge.cpp more carefully.
#
# If you do, the directive you are looking for here is 
# Around line 20 called "set(exports"
#
# @Jemoka

# Setting the project name
set(project "CondutionCore")

# Loading the project
project(${project})
# 3.12 or something b/c set_target_properties
cmake_minimum_required(VERSION 3.12)

# Get all the sources
file(GLOB_RECURSE sources "src/*.cpp" "lib/*.hpp")

# Specify the executable and link sources 
add_executable(${project} ${sources})

# Include the lib folder as a public library
target_include_directories(${project} PUBLIC "lib")

# Chuck the output to the api/ folder for JS
set(EXECUTABLE_OUTPUT_PATH "api")

# Raw **C** API exposures to JS. Need to use `extern "C"` derective on these
# and they may not call any functions that utilize mangled C++ code.
# If a function is like int bontehu(int a), the name you put here is 
# _bontehu. Notice the Underscore.

set(exports 
    # anything and everything
    # consider why you are exposing
    # before you do. EMSCRIPTEN_BINDINGS
    # will fix most of your problems
 )

# process exported functions bu chaining it into a list
set(exports_string "")
list(JOIN exports "," exports_string)

# set compiler flags and add things
set_target_properties(${project} PROPERTIES LINK_FLAGS "-s WASM=1 -s EXPORTED_FUNCTIONS='[${exports_string}]' -s EXTRA_EXPORTED_RUNTIME_METHODS='[ccall, cwrap]' --bind")


