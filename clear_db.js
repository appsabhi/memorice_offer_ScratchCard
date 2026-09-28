import { Pool } from 'pg';
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf-8');
const urlMatch = envText.match(/POSTGRES_URL="?([^"\n]+)"?/);
const url = urlMatch ? urlMatch[1] : process.env.POSTGRES_URL;

if (!url) {
  console.error("Could not find POSTGRES_URL in .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
console.log("Connecting to database and clearing test claims...");

pool.query('TRUNCATE TABLE public.claims RESTART IDENTITY;')
  .then(() => { 
    console.log('Database successfully cleared! All test claims deleted.'); 
    pool.end(); 
  })
  .catch(err => { 
    console.error('Error clearing database:', err); 
    pool.end(); 
  });
