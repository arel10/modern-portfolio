import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Simple .env parser to avoid extra dependencies
function loadEnv() {
  const envPath = path.join(rootDir, '.env')
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env file not found at', envPath)
    return
  }

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

    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

loadEnv()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL tidak ditemukan di .env')
  process.exit(1)
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl:
    process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,
})

async function resetAndSeed() {
  console.log('🔄 Memulai proses Reset & Seed Database PostgreSQL...')
  console.log(`📡 Menghubungkan ke database: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`)

  const client = await pool.connect()

  try {
    console.log('🗑️  Menghapus tabel-tabel lama (Reset Database)...')
    await client.query(`
      DROP TABLE IF EXISTS
        admin_users,
        contact_messages,
        chat_messages,
        chat_sessions,
        tech_items,
        tech_categories,
        projects,
        experiences,
        socials,
        quick_stats,
        roles,
        profile
      CASCADE;
      DROP FUNCTION IF EXISTS set_updated_at CASCADE;
    `)
    console.log('✅ Semua tabel lama berhasil dihapus.')

    console.log('📜 Membaca dan menjalankan lib/schema.sql...')
    const schemaPath = path.join(rootDir, 'lib', 'schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    await client.query(schemaSql)
    console.log('✅ Skema tabel & initial portfolio data berhasil dibuat.')

    // Setup Admin User from .env
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminEmail = process.env.ADMIN_EMAIL || 'afchaarelpratama@gmail.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'afchaarel1006'

    console.log(`🔐 Membuat akun admin dari .env:`)
    console.log(`   - Username : ${adminUsername}`)
    console.log(`   - Email    : ${adminEmail}`)
    console.log(`   - Password : ${adminPassword.replace(/./g, '*')}`)

    const passwordHash = await bcrypt.hash(adminPassword, 10)

    await client.query(
      `
      INSERT INTO admin_users (username, email, password_hash, is_active)
      VALUES ($1, $2, $3, TRUE)
      ON CONFLICT (email) DO UPDATE
      SET username = EXCLUDED.username,
          password_hash = EXCLUDED.password_hash,
          is_active = TRUE,
          updated_at = NOW();
      `,
      [adminUsername, adminEmail, passwordHash]
    )
    console.log('✅ Akun admin berhasil di-seed ke tabel admin_users.')

    // Validasi data
    console.log('\n📊 Ringkasan data database setelah seed:')
    const tables = [
      'profile',
      'roles',
      'quick_stats',
      'socials',
      'experiences',
      'projects',
      'tech_categories',
      'tech_items',
      'admin_users',
    ]

    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) as count FROM ${t}`)
      console.log(`   • ${t.padEnd(16)} : ${res.rows[0].count} baris`)
    }

    const adminCheck = await client.query(
      `SELECT id, username, email, is_active, created_at FROM admin_users`
    )
    console.log('\n👤 Data Admin User aktif:')
    console.table(adminCheck.rows)

    console.log('\n🎉 Database reset & seed selesai dengan sukses!')
  } catch (error) {
    console.error('❌ Gagal melakukan reset/seed database:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

resetAndSeed()
