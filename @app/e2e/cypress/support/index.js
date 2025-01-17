// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')
// store logs
let logs = "";

Cypress.on("window:before:load", (window) => {
  // Get your apps iframe by id. Ours is called "Your App: 'cypress'". If yours is different
  // just replace with your apps iframe id
  const docIframe = window.parent.document.getElementById("Your App: 'e2e'");

  // Get the window object inside of the iframe
  const appWindow = docIframe.contentWindow;

  // This is where I overwrite all of the console methods.
  ["log", "info", "error", "warn", "debug"].forEach((consoleProperty) => {
    appWindow.console[consoleProperty] = function (...args) {
      /*
       * The args parameter will be all of the values passed as arguments to
       * the console method. ( If your not using es6 then you can use `arguments`)
       * Example:
       *       If your app uses does `console.log('argument1', 'arument2');`
       *       Then args will be `[ 'argument1', 'arument2' ]`
       */
      // Save everything passed into a variable or any other solution
      // you make to keep track of the logs
      logs += args.join(" ") + "\n";
    };
  });
});

// Cypress doesn't have a each test event
// so I'm using mochas events to clear log state after every test.
Cypress.mocha.getRunner().on("test", () => {
  // Every test reset your logs to be empty
  // This will make sure only logs from that test suite will be logged if a error happens
  logs = "";
});

// On a cypress fail. I add the console logs, from the start of test or after the last test fail to the
// current fail, to the end of the error.stack property.
Cypress.on("fail", (error) => {
  error.stack += "\nConsole Logs:\n========================";
  error.stack += logs;
  // clear logs after fail so we dont see duplicate logs
  logs = "";
  // still need to throw the error so tests wont be marked as a pass
  throw error;
});
