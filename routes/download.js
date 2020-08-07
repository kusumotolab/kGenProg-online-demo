const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;



router.get('/:key', async (req, res) => {
  try {
  } catch (err) {
    res.status(err.status || 500);
    res.render(req.params.key);
    console.error(err);
  }
});

module.exports = router;
