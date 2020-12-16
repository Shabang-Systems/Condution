set(project "CondutionEngine")

project(${project})
cmake_minimum_required(VERSION 3.12)

# source list
file(GLOB_RECURSE bar "src/*.cpp" "lib/*.hpp")

# specify the executable
add_executable(${project} ${bar})
target_include_directories(${project} "lib")
set(EXECUTABLE_OUTPUT_PATH "api")

# API exposures to JS
set(exports 
   _scratch_debug
 )

# process exported functions
set(exports_string "")
list(JOIN exports "," exports_string)

# set compiler and flags

set_target_properties(${project} PROPERTIES LINK_FLAGS "-s WASM=1 -s EXPORTED_FUNCTIONS='[${exports_string}]'")


