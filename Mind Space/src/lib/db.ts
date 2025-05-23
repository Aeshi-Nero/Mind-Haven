import { Pool } from 'pg';

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_1mf2biNCWehg@ep-autumn-frost-a5m64hjv.us-east-2.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;