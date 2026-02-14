const mongoose = require('mongoose');
require('./Permission'); // Register Permission model explicitly

const RoleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true
    // unique: true // REMOVED: Global uniqueness prevents multi-tenancy
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
      // default: null // System roles (Global) have no company
  },
  description: {
    type: String
  },
  scope: {
      type: String,
      enum: ['global', 'company'],
      default: 'company'
  },
  isSystemRole: {
    type: Boolean,
    default: false // Identifying system roles like Super Admin that cannot be deleted
  },
  accessibleByCompanyAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Enforce uniqueness of Role Name per Company
// If company is null (System Role), duplicate names should still be avoided ideally, 
// but this index allows multiple nulls unless sparse is used correctly.
// For simplicity, we want (roleName, company) to be unique.
RoleSchema.index({ roleName: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Role', RoleSchema);
