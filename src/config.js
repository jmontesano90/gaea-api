module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'dbname=dhnmoe4ul3odq host=ec2-52-21-247-176.compute-1.amazonaws.com port=5432 user=kfyjxaneryoorr password=5d163b14f781071d0674b06d6af3a5594b61ed91ea00cb08fd73da26afe94271 sslmode=require',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
};
