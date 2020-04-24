const express = require('express');
const router = express.Router();
const wsConnections = new Map();

router.ws("/:host/:key", (ws, req) => {
  console.log("socket from client");
  wsConnections.set(req.key, ws);
  ws.on('close', ()=>wsConnections.delete(req.key));
});

module.exports = router;
module.exports.wsConnections = wsConnections;