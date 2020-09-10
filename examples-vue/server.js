/* eslint-enable */
const process = require('process');
const fs = require("fs");
const p = require("path");
const exec = require('child_process').exec;
const args = process.argv;
const [host, fullpath, firstArg] = args;
// console.log(`cwd: ${process.cwd()}`);
// const toPath = process.cwd() + '/examples-vue';
console.log("__dirname:", __dirname);
process.chdir(__dirname);

if (firstArg == 'i') {
  installPkgs();
}
if (firstArg == 'start') {
  runScript('node_modules/.bin/vue-cli-service serve');
}
if (firstArg == 'dev') {
  runScript('node_modules/.bin/vue-cli-service serve');
}
if (firstArg == 'build') {
  runScript('node_modules/.bin/vue-cli-service build');
}
function installPkgs(callback) {
  let fielPath = p.join(__dirname, "package-lock.json");
  if (fs.existsSync(fielPath)) {
    fs.unlinkSync(fielPath);
  }
  console.log('run: npm i');
  const cmdStr = 'npm install --no-package-lock';
  exec(cmdStr, { maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      console.warn(new Date(), cmdStr + ' exec failed');
    } else {
      console.log(stdout);
      console.warn(new Date(), cmdStr + ' exec succeed');
      callback && callback();
    }
  });
}
function runScript(script, callback) {
  console.log('run: ' + script);
  const cmdStr = script;
  exec(cmdStr, { maxBuffer: 1024 * 500, }, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      console.warn(new Date(), cmdStr + ' exec failed');
    } else {
      console.log(stdout);
      console.warn(new Date(), cmdStr + ' exec succeed');
      callback && callback();
    }
  });
}
