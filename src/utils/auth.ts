// src/utils/auth.ts
import bcrypt from 'bcryptjs';

// We use a salt round of 10 (standard for client-side hashing in demo apps)
const SALT_ROUNDS = 10;

export const hashPassword = async (plainTextPassword: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainTextPassword, salt);
};

export const verifyPassword = async (
  plainTextPassword: string, 
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};