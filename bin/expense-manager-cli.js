#!/usr/bin/env node

const program = require('commander');

program
  .version(require('../package').version)
  .command('search [name]', 'search reports by optional query')
  .command('list-category', 'list all categories')
  .parse(process.argv);

