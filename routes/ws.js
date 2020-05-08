const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const submissionBase = require('./submission').submissionBase;
const processing = Array();

function execJava(key) {
  const dir = path.join(submissionBase, key);
  const child = require('child_process');
  const kgp = path.resolve('./bin/kgp.jar');
  return child.spawn('java',
      ['-jar', kgp, '-r', './', '-s', 'src/main', '-t', 'src/test',
        '--max-generation', '1000', '--time-limit', '300'],
      {cwd: dir});
}

function closeKgp(spawn, key, ws) {
  spawn.on('close', (code) => {
    console.log(`[${key}]`, 'kgp finish with code', code);
    const index = processing.findIndex(e => e === key);
    processing.splice(index, 1);
    ws.close();
  });
}

function wsSend(key, data, ws) {
  ws.send(JSON.stringify({
    key: key,
    stdout: data
  }));
}

function writeStdout(spawn, key, ws) {
  const stdout = path.join(submissionBase, key, 'stdout.txt');
  spawn.stdout.on('data', (data) => {
    fs.appendFile(stdout, data).catch(err => console.error(err));
    wsSend(key, data.toString(), ws);
  });
  spawn.stderr.on('data', (data) => {
    fs.appendFile(stdout, data).catch(err => console.error(err));
    wsSend(key, data.toString(), ws);
  });
}

function runKgp(key, ws) {
  const spawn = execJava(key);
  writeStdout(spawn, key, ws);
  closeKgp(spawn, key, ws);
  processing.push(key);
}

router.ws("/:key", (ws, req) => {
  const key = req.params.key;
  console.log(`[${key}]`, "connected websocket");
  runKgp(key, ws);
  ws.on('close', () => console.log(`[${key}]`, "closed websocket"))
});

module.exports = router;
module.exports.processing = processing;
