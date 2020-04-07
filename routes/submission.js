const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const submissionBase = path.resolve('./tmp/kgp-od');
const processing = Array();

async function deploy(file, data) {
  await fs.mkdir(path.dirname(file), {recursive: true});
  await fs.writeFile(file, data);
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
  const src = path.join(dir, 'src/main', getFQN(body.src));
  const test = path.join(dir, 'src/test', getFQN(body.test))
  const stdout = path.join(dir, 'stdout.txt');
  return Promise.all([deploy(src, body.src),
    deploy(test, body.test)], deploy(stdout, ''));
}

function execJava(dir) {
  const child = require('child_process');
  const kgp = path.resolve('./bin/kgp.jar');
  return child.spawn('java',
      ['-jar', kgp, '-r', './', '-s', 'src/main', '-t', 'src/test'],
      {cwd: dir});
}

function closeKgp(spawn, dir) {
  spawn.on('close', (code) => {
    console.log(`[${path.basename(dir)}]`, 'kgp finish with code', code);
    const index = processing.findIndex(e => e === path.dirname(dir));
    processing.splice(index, 1);
  });
}

function writeStdout(spawn, dir) {
  const stdout = path.join(dir, 'stdout.txt');
  spawn.stdout.on('data', (data) => {
    fs.appendFile(stdout, data).catch(err => console.error(err));
  });
  spawn.stderr.on('data', (data) => {
    fs.appendFile(stdout, data).catch(err => console.error(err));
  });
}

function runKgp(dir) {
  const spawn = execJava(dir);
  writeStdout(spawn, dir);
  closeKgp(spawn, dir);
  processing.push(path.basename(dir));
}

function createKey(req) {
  const crypto = require('crypto');
  require('date-utils');
  const datetime = new Date().toFormat('YYYYMMDDHH24MISS');
  //todo 短いハッシュにする
  return crypto.createHash('md5').update(
      datetime + req.body.src + req.body.test).digest('hex');
}

function acceptSubmission(req, res) {
  const key = createKey(req);
  console.log(`[${key}]`, 'accept submission');
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send({
    'key': key,
    'status': 'starting',
    'stdout': ''
  });
  return path.join(submissionBase, key);
}

router.post('/', async (req, res) => {
  try {
    const submissionDir = acceptSubmission(req, res);
    await deployConfig(submissionDir, req.body);
    runKgp(submissionDir);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
module.exports.processing = processing;
module.exports.submissionBase = submissionBase;
