const prisma = require('../lib/prisma');

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected successfully via Prisma');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
