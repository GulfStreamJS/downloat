#! /usr/bin/env node

const downloat = require('../');

let args = process.argv.slice(2);

if (args && args[0]) {
    downloat({source: args[0]}).then(params => {
        if (params.downloat && !params.downloat.error) {
            console.log(JSON.stringify(params.downloat, null, 2));
        }
    });
}