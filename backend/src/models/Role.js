const mongoose = require('mongoose');
require('./Permission'); // Register Permission model explicitly

const RoleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  description: {
    type: String
  },
  isSystemRole: {
    type: Boolean,
    default: false // Identifying system roles like Super Admin that cannot be deleted
  }
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);
