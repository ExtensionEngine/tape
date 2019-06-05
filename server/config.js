'use strict';

module.exports = {
  hostname: process.env.HOSTNAME,
  port: process.env.PORT,
  ip: process.env.IP,
  uploadLimit: '10mb',
  cors: {
    allowedOrigins: [],
    allowedHeaders: []
  },
  auth: {
    saltRounds: parseInt(process.env.AUTH_SALT_ROUNDS, 10),
    scheme: process.env.AUTH_JWT_SCHEME || 'JWT',
    secret: process.env.AUTH_JWT_SECRET,
    issuer: process.env.AUTH_JWT_ISSUER,
    audience: process.env.AUTH_JWT_AUDIENCE
  },
  email: {
    sender: {
      name: process.env.EMAIL_SENDER_NAME,
      address: process.env.EMAIL_SENDER_ADDRESS
    },
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || null,
    ssl: process.env.EMAIL_SSL,
    tls: process.env.EMAIL_TLS
  }
};
