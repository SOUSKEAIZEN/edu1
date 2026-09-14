"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'staging', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(3001),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    OPENAI_API_KEY: zod_1.z.string().optional(), // Optional for now as we mock LLM
    JWT_SECRET: zod_1.z.string().min(32, "JWT_SECRET must be at least 32 characters for security").default('super_secret_development_key_do_not_use_in_prod_12345'),
});
function validateEnv() {
    try {
        const env = EnvSchema.parse(process.env);
        if (env.NODE_ENV === 'production' && env.JWT_SECRET.includes('development_key')) {
            throw new Error("CRITICAL: Cannot use default development JWT_SECRET in production");
        }
        return env;
    }
    catch (err) {
        console.error("❌ Invalid environment variables:", err.errors || err.message);
        process.exit(1);
    }
}
exports.ENV = validateEnv();
