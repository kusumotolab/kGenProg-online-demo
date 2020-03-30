const express = require('express');
const router = express.Router();
const path = require('path');
const child = require('child_process');
const fs = require('fs').promises;
const submissionBase = path.resolve('./tmp');
const kgp = path.resolve('./kGenProg-1.5.5.jar');  //環境に合わせる
let key = 0;

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

function extractName(src) {
  return path.join(getPackageName(src).replace('.', '/'),
      getClassName(src) + '.java');
}

function deployConfig(dir, body) {
  const srcFile = path.join(dir, 'src/main', extractName(body.src));
  const testFile = path.join(dir, 'src/test', extractName(body.test));
  return Promise.all([deploy(srcFile, body.src),
    deploy(testFile, body.test)]);
}

function runJava(dir) {
  return child.spawn('java',
      ['-jar', kgp, '-r', './', '-s', 'src/main', '-t', 'src/test'],
      {cwd: dir});
}

function monitorKgp(spawn) {
  spawn.stderr.on('data', (data) => {
    console.log('STDERR', data.toString());
  });
  spawn.on('close', (code) => {
    console.log('CODE', code);
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
  const spawn = runJava(dir);
  writeStdout(spawn, dir);
  monitorKgp(spawn);
}

router.post('/', async (req, res) => {
  const submissionDir = path.join(submissionBase, key.toString());

  console.log(`accept submission${key}`);
  res.send(key.toString());
  key++;
  try {
    console.log("-----------------" + req.body.src);
    await deployConfig(submissionDir, req.body);
    runKgp(submissionDir);
  } catch (e) {
    console.error(e);
    throw e;
  }
});

module.exports = router;
