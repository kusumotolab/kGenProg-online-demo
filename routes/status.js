const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const processing = require('./submission').processing;
const submissionBase = path.resolve('./tmp');

async function sendStatus(res, key) {
  const stdout = await readStdout(key);
  const status = processing.includes(key) ? 'processing' : 'done';
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send({
    'key': key,
    'status': status,
    'stdout': stdout
  });
}

function readStdout(key) {
  const file = path.join(submissionBase, key, 'stdout.txt');
  return fs.readFile(file, 'utf-8');
}

router.get('/:key', async (req, res) => {
  try {
    sendStatus(res, req.params.key, stdout);
  } catch (e) {
    res.status(e.status || 500);
    res.render(req.params.key);
    console.log(e);
    throw e;
  }
});

module.exports = router;