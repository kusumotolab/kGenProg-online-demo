const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

function readStdout(key) {
  const submissionBase = require('./submission').submissionBase;
  const file = path.join(submissionBase, key, 'stdout.txt');
  return fs.readFile(file, 'utf-8');
}

async function sendStatus(res, key) {
  const processing = require('./submission').processing;
  const stdout = await readStdout(key);
  const status = processing.includes(key) ? 'processing' : 'done';
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.send({
    'key': key,
    'status': status,
    'stdout': stdout
  });
}

router.get('/:key', async (req, res) => {
  try {
    sendStatus(res, req.params.key);
  } catch (err) {
    res.status(err.status || 500);
    res.render(req.params.key);
    console.error(err);
  }
});

module.exports = router;