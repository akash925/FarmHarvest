import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For development, provide a more helpful error message and fallback options
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(`
🚨 DATABASE_URL is not set!

For local development, you have a few options:

1. Use a free Neon database (recommended):
   - Go to https://neon.tech
   - Create a free account and database
   - Copy the connection string to a .env file:
     DATABASE_URL=postgresql://username:password@host/database

2. Use a local PostgreSQL database:
   - Install PostgreSQL locally
   - Create a database called 'farmdirect'
   - Set: DATABASE_URL=postgresql://localhost:5432/farmdirect

3. Set up environment variables:
   - Create a .env file in the project root
   - Add the DATABASE_URL variable
   
Current working directory: ${process.cwd()}
  `);
  
  throw new Error("DATABASE_URL must be set. See the instructions above.");
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });
