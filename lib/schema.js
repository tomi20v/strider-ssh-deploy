'use strict';

module.exports = {
  scp: {
    type: String,
    enum: ['none','pack','custom'],
    default: 'none'
  },
  customcommand: {
    type: String,
    default: ''
  },
  user: {
    type: String,
    default: ''
  },
  hosts: {
    type: Array,
    default: []
  },
  script: {
    type: String,
    default: '# shell script to run on the remote host(s)'
  }
};
