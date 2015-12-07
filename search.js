'use strict';
const ExpenseManager = require('expense-manager-core');
const Table = require('cli-table2');
const path = require('path');
const fs = require('mz/fs');

const tableOptions = {
  head: [
    'expensed',
    'amount',
    'category',
    'sub-category',
    'description',
  ],
};
const sqliteDbExtensionRegEx = /^(.+)\.db$/;

function sqliteDbExtension(value) {
  return sqliteDbExtensionRegEx.test(value);
}

function joinParentPath(parentPath) {
  return function joinParentPathIterator(fileName) {
    return path.join(parentPath, fileName);
  };
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function convertDateToString(date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1, 2);
  const day = pad(date.getDate(), 2);
  return `${year}\/${month}\/${day}`;
}

function searchByDb(options) {
  return function* searchByDbIterator(dbPath) {
    const expenseManager = new ExpenseManager(dbPath);
    let reports;
    if (options.byCategory && options.name) {
    } else if (options.name) {
      reports = yield expenseManager.report.getByName(options.name);
    } else {
      reports = yield expenseManager.report.get();
    }
    return reports;
  };
}

function concatArrayItems(a, b) {
  return a.concat(b);
}

module.exports = function* search(options) {
  let dbPaths;
  if (options.dbPaths) {
    dbPaths = yield fs.readdir(options.dbPaths);
    dbPaths = dbPaths
      .filter(sqliteDbExtension)
      .map(joinParentPath(options.dbPaths));
  } else if (options.dbPath) {
    dbPaths = [ options.dbPath ];
  }
  let reports = yield dbPaths.map(searchByDb(options));
  reports = reports.reduce(concatArrayItems);
  let table = new Table(tableOptions);
  reports.forEach(function(report) {
    const symbol = report.category === 'Income' ? '+' : '-';
    const amountByType = symbol + report.amount;
    let row = [
      convertDateToString(report.expensed),
      amountByType,
      report.category,
      report.subCategory,
      report.description,
    ];
    table.push(row);
  });
  console.log(table.toString());
};

