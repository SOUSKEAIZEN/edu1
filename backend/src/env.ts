import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  OPENAI_API_KEY: z.string().optional(), // Optional for now as we mock LLM
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for security").default('super_secret_development_key_do_not_use_in_prod_12345'),
});

export function validateEnv() {
  try {
    const env = EnvSchema.parse(process.env);
    
    if (env.NODE_ENV === 'production' && env.JWT_SECRET.includes('development_key')) {
      throw new Error("CRITICAL: Cannot use default development JWT_SECRET in production");
    }
    
    return env;
  } catch (err: any) {
    console.error("❌ Invalid environment variables:", err.errors || err.message);
    process.exit(1);
  }
}

export const ENV = validateEnv();
