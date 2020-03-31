const express = require('express');
const router = express.Router();
const path = require('path');
const child = require('child_process');
const fs = require('fs').promises;
const crypto = require('crypto');
require('date-utils');
const submissionBase = path.resolve('./tmp/kgp-od');
const kgp = path.resolve('./bin/kgp.jar');
const processing = Array();

async function deploy(file, data) {
  try {
    await fs.mkdir(path.dirname(file), {recursive: true});
    await fs.writeFile(file, data);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

function getPackageName(src) {
  const packageDeclaration = src.match(/^\s*package\s+(.+);/);
  return packageDeclaration ? packageDeclaration[1] : '';
}

function getClassName(src) {
  const classDeclaration = src.match(/^.*class\s+([^{\s]+)\s*{/m);
  return classDeclaration ? classDeclaration[1] : '';
}

function getFQN(src) {
  return path.join(getPackageName(src).replace('.', '/'),
      getClassName(src) + '.java');
}

function deployConfig(dir, body) {
  const srcFile = path.join(dir, 'src/main', getFQN(body.src));
  const testFile = path.join(dir, 'src/test', getFQN(body.test));
  return Promise.all([deploy(srcFile, body.src),
    deploy(testFile, body.test)]);
}

function execJava(dir) {
  return child.spawn('java',
      ['-jar', kgp, '-r', './', '-s', 'src/main', '-t', 'src/test'],
      {cwd: dir});
}

function traceKgp(spawn, dir) {
  spawn.stderr.on('data', (data) => {
    console.log('STDERR', data.toString());
  });
  spawn.on('close', (code) => {
    console.log('CODE', code);
    const index = processing.findIndex(e => e === path.dirname(dir));
    processing.splice(index, 1);
  });
}

function writeStdout(spawn, dir) {
  const outFile = path.join(dir, 'stdout.txt');
  spawn.stdout.on('data', (data) => {
    fs.appendFile(outFile, data).catch(
        err => {
          console.log(err);
          throw err;
        });
  });
}

function runKgp(dir) {
  const spawn = execJava(dir);
  writeStdout(spawn, dir);
  traceKgp(spawn, dir);
  processing.push(path.basename(dir));
  console.log(path.basename(dir));
}

function createKey(req) {
  const datetime = new Date().toFormat('YYYYMMDDHH24MISS');
  //todo 短いハッシュにする
  return crypto.createHash('md5').update(
      datetime + req.body.src + req.body.test).digest('hex');
}

function acceptSubmission(req, res) {
  const key = createKey(req);
  console.log(`accept submission ${key}`);
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send({
    'key': key.toString(),
    'status': 'starting',
    'stdout': ''
  });

  return path.join(submissionBase, key);
}

router.post('/', async (req, res) => {
  try {
    // console.log("-----------------" + req.body.src);
    const submissionDir = acceptSubmission(req, res);
    await deployConfig(submissionDir, req.body);
    runKgp(submissionDir);
  } catch (e) {
    console.error(e);
    throw e;
  }
});

module.exports = router;
module.exports.processing = processing;
module.exports.submissionBase = submissionBase;
