#!/usr/bin/env node

"use strict";

var programmaticRunner = require("./programmaticRunner");
var adapter = require("./adapter")

programmaticRunner(adapter, {}, function (err) {
    if (err) {
        process.exit(err.failures || -1);
    }
});

