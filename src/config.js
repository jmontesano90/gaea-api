module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://postgres@localhost/gaea',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwb28iLCJuYW1lIjoiSm9lIENvb2wiLCJpYXQiOjE1MTYyMzkwMjJ9.4tRh3eVlYVN5rc1b4LwujSTBhtb3Dkx4Hkbk5iE79vY',
};
