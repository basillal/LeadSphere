const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  permissionName: {
    type: String,
    required: true,
    unique: true
  },
  resource: {
    type: String,
    required: true
  },
  method: {
    type: String, // GET, POST, PUT, DELETE, etc.
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ANY'],
    required: true
  },
  description: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Permission', PermissionSchema);
