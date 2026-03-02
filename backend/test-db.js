const mongoose = require('mongoose');
const AuditLog = require('./src/models/AuditLog');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/leadsphere_test')
  .then(async () => {
    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find().limit(3).exec();
    console.log(`TOTAL LOGS: ${total}`);
    console.log(`SAMPLE LOGS: ${JSON.stringify(logs, null, 2)}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
