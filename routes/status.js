const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const submissionBase = path.resolve('../../test-nodejs');  //環境に合わせる

router.get('/:key', async (req, res) => {
  const outFile = path.join(submissionBase, req.params.key.toString(),
      'stdout.txt');
  try {
    const data = await fs.readFile(outFile, 'utf-8')
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send({'stdout': data});
  } catch(e) {
    res.status(404);
    res.end('not found key: ' + req.params.key.toString());
    console.log(e);
    throw e;
  }
});

module.exports = router;
