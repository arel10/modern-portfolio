import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

function loadEnv() {
  const envPath = path.join(rootDir, '.env')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.substring(0, eqIdx).trim()
    let val = trimmed.substring(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/portfolio_db',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

async function run() {
  const client = await pool.connect()
  try {
    console.log('Migrating: creating educations table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS educations (
        id              SERIAL PRIMARY KEY,
        institution     VARCHAR(200) NOT NULL,
        degree          VARCHAR(200) NOT NULL,
        field_of_study  VARCHAR(200),
        date_range      VARCHAR(100) NOT NULL,
        grade           VARCHAR(50),
        description     TEXT,
        image_url       VARCHAR(500),
        skills          TEXT[]       NOT NULL DEFAULT '{}',
        sort_order      INT          NOT NULL DEFAULT 0,
        is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)

    // Check if empty, insert default education
    const { rows } = await client.query('SELECT COUNT(*) FROM educations')
    if (parseInt(rows[0].count, 10) === 0) {
      console.log('Seeding initial education record...')
      await client.query(`
        INSERT INTO educations (
          institution, degree, field_of_study, date_range, grade, description, image_url, skills, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 1
        );
      `, [
        'Politeknik Negeri Padang',
        'Sarjana Terapan (D4)',
        'Rekayasa Perangkat Lunak (Software Engineering)',
        '2021 – 2025',
        'IPK 3.44 / 4.00',
        'Fokus pada rekayasa perangkat lunak, arsitektur web modern, basis data relasional, dan pengembangan sistem berskala besar. Aktif dalam proyek penelitian dan pengembangan aplikasi SaaS.',
        '/images/hero.jpg',
        ['Software Engineering', 'Fullstack Development', 'Database Design', 'SaaS Architecture', 'Algorithms & Data Structures'],
      ])
      console.log('✅ Initial education record seeded.')
    } else {
      console.log('ℹ️  Educations table already has records.')
    }
    console.log('✅ Migration completed successfully.')
  } catch (err) {
    console.error('❌ Migration error:', err)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
