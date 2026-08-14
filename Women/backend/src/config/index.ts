import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'safeher_super_secure_production_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  mapsApiKey: process.env.MAPS_API_KEY || '',
  aiApiKey: process.env.AI_API_KEY || '',
  smsProviderKey: process.env.SMS_PROVIDER_KEY || '',
  emailProviderKey: process.env.EMAIL_PROVIDER_KEY || '',
  adminDefaultEmail: process.env.ADMIN_DEFAULT_EMAIL || 'admin@safeher.ai',
  adminDefaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'Eswara@2',
};
