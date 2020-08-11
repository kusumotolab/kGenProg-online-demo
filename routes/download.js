const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const archiveBase = path.resolve('./tmp/archive');

async function createArchive(key) {
  const submissionBase = require('./submission').submissionBase;
  const kgp = path.resolve('./bin/kgp.jar');
  await fs.promises.mkdir(archiveBase, {recursive: true});
  const output = fs.createWriteStream(path.join(archiveBase, `${key}.zip`));
  const archive = archiver('zip', {zlib: {level: 6}});
  archive.pipe(output);
  archive.directory(path.join(submissionBase, key), false)
      .file(kgp, {name: 'kgp.jar'})
      .finalize();
  return new Promise((resolve, reject) => {
    output.on('close', () => resolve(archive));
    archive.on('error', (err) => reject(err));
  });
}

async function exportArchive(res, key) {
  await createArchive(key);
  res.download(path.join(archiveBase, `${key}.zip`), `${key}.zip`);
}

router.get('/:key', (req, res) => {
  exportArchive(res, req.params.key).catch(err => console.error(err));
});

module.exports = router;
