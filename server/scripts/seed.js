'use strict';

require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const permissions = [
  { name: 'create-ticket', description: 'Create a new ticket' },
  { name: 'read-ticket', description: 'Read ticket data' },
  { name: 'update-ticket', description: 'Update a ticket' },
  { name: 'delete-ticket', description: 'Delete a ticket' },
];

const roles = [
  {
    name: 'waiter',
    description: 'Waiter role with basic ticket access',
    permissions: ['create-ticket', 'read-ticket']
  },
  {
    name: 'manager',
    description: 'Manager role with extended ticket access',
    permissions: ['create-ticket', 'read-ticket', 'update-ticket']
  },
  {
    name: 'admin',
    description: 'Admin role with full access',
    permissions: ['create-ticket', 'read-ticket', 'update-ticket', 'delete-ticket']
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Permission.deleteMany({});
    await Role.deleteMany({});

    // Create permissions
    const createdPermissions = await Permission.insertMany(permissions);
    console.log('Permissions created.');

    const permissionMap = createdPermissions.reduce((acc, permission) => {
      acc[permission.name] = permission._id;
      return acc;
    }, {});

    // Create roles
    const rolesToCreate = roles.map(role => ({
      ...role,
      permissions: role.permissions.map(name => permissionMap[name])
    }));

    await Role.insertMany(rolesToCreate);
    console.log('Roles created and permissions assigned.');

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

seed();
