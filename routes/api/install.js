const express = require('express');
const router = express.Router();
const { install } = require('../../database/install');

router.get('/', async (req, res) => {
  const originalLog = console.log;
  const originalError = console.error;
  let output = '';
  
  console.log = (...args) => {
    const msg = args.join(' ');
    output += msg + '\n';
    originalLog(...args);
  };
  
  console.error = (...args) => {
    const msg = args.join(' ');
    output += msg + '\n';
    originalError(...args);
  };
  
  try {
    await install();
    res.setHeader('Content-Type', 'text/plain');
    res.send(output + '\n\nInstallation complete! You can now refresh the page.');
  } catch (error) {
    res.status(500);
    res.setHeader('Content-Type', 'text/plain');
    res.send(output + '\n\n✗ Installation failed: ' + error.message);
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
});

module.exports = router;

