# gruntdemo
GruntJS demo showing uglify/jshint/shifter capabilities.

This was made to show off things that can be applied to the Moodle repository as an early prototype.

# Prerequisites
* NodeJS
* Shifter (should be installed globally)

# Setup
1. Clone this repository
2. cd into repository
3. run `npm install` (note: you may need to run this as root)
4. In an AMD directory
  * Run `grunt` to run jshint and uglify
5. In a YUI directory
  * Run `grunt` to run shifter. This will lint code and minify it.
