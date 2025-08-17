const serverless = require('serverless-http');
require('dotenv').config();
const http = require('http');

const { createApp } = require('../src/app.cjs');

const app = createApp();

module.exports = (req, res) => {
  const handler = serverless(app);
  return handler(req, res);
};
