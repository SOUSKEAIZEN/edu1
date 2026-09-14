"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const env_1 = require("../env");
const pool = new pg_1.Pool({
    connectionString: env_1.ENV.DATABASE_URL,
    max: env_1.ENV.NODE_ENV === 'production' ? 50 : 10, // Limit connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});
const query = (text, params) => pool.query(text, params);
exports.query = query;
const getClient = () => pool.connect();
exports.getClient = getClient;
