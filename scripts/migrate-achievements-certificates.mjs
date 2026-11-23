import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/portfolio_db',
})

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('Connected to PostgreSQL. Running migrations for achievements & certificates...')
    await client.query('BEGIN')

    // 1. Table achievements (Publikasi Jurnal, Lomba, Prestasi)
    await client.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(250) NOT NULL,
        category    VARCHAR(50)  NOT NULL DEFAULT 'prestasi', -- 'jurnal', 'prestasi', 'penghargaan', 'lainnya'
        issuer      VARCHAR(200) NOT NULL,
        date        VARCHAR(100) NOT NULL,
        description TEXT,
        link_url    VARCHAR(500),
        image_url   VARCHAR(500),
        skills      TEXT[]       NOT NULL DEFAULT '{}',
        sort_order  INT          NOT NULL DEFAULT 0,
        is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)
    console.log('Table achievements verified.')

    // 2. Table certificates (Sertifikasi Profesional & Lisensi)
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id              SERIAL PRIMARY KEY,
        title           VARCHAR(250) NOT NULL,
        issuer          VARCHAR(200) NOT NULL,
        issue_date      VARCHAR(100) NOT NULL,
        expiration_date VARCHAR(100),
        credential_id   VARCHAR(150),
        credential_url  VARCHAR(500),
        image_url       VARCHAR(500),
        skills          TEXT[]       NOT NULL DEFAULT '{}',
        sort_order      INT          NOT NULL DEFAULT 0,
        is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `)
    console.log('Table certificates verified.')

    // 3. Seed initial achievements if empty
    const { rows: achRows } = await client.query('SELECT COUNT(*) as count FROM achievements')
    if (parseInt(achRows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO achievements (title, category, issuer, date, description, link_url, image_url, skills, sort_order)
        VALUES 
        (
          'Publikasi Jurnal Ilmiah: Machine Learning untuk Prediksi Churn Nasabah Bank Sampah Digital',
          'jurnal',
          'Jurnal Teknologi Informasi & Ilmu Komputer (JTIIK)',
          'Desember 2024',
          'Penelitian implementasi algoritma Random Forest Classifier dalam memprediksi customer churn rate pada platform bank sampah digital dengan tingkat akurasi mencapai 87.82%.',
          'https://doi.org/10.25126/jtiik',
          '/images/portofolio.jpeg',
          ARRAY['Machine Learning', 'Python', 'Random Forest', 'Data Science', 'Scikit-Learn'],
          1
        ),
        (
          'Juara 1 Hackathon Inovasi Digital Nasional — Smart Waste Management',
          'prestasi',
          'Kementerian Komunikasi dan Digital RI',
          'November 2024',
          'Memimpin tim pengembangan solusi digital bank sampah berbasis IoT dan mobile app yang berhasil memenangkan peringkat pertama dari 150+ tim mahasiswa se-Indonesia.',
          '#',
          '/images/hero.jpg',
          ARRAY['Product Design', 'Next.js', 'Flutter', 'IoT Integration', 'Presentation Pitch'],
          2
        );
      `)
      console.log('Default achievements seeded.')
    }

    // 4. Seed initial certificates if empty
    const { rows: certRows } = await client.query('SELECT COUNT(*) as count FROM certificates')
    if (parseInt(certRows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO certificates (title, issuer, issue_date, expiration_date, credential_id, credential_url, image_url, skills, sort_order)
        VALUES 
        (
          'Associate Cloud Engineer Certification',
          'Google Cloud',
          'November 2024',
          'November 2027',
          'GCP-ACE-892410',
          'https://www.credential.net',
          '/images/portofolio.jpeg',
          ARRAY['Google Cloud Platform', 'Kubernetes', 'Compute Engine', 'Cloud Architecture', 'IAM & Security'],
          1
        ),
        (
          'Menjadi Back-End Developer Expert',
          'Dicoding Indonesia',
          'Agustus 2024',
          'Tidak Ada Kadaluarsa',
          'DICODING-BACKEND-7731',
          'https://www.dicoding.com/certificates',
          '/images/jadibotwa.jpeg',
          ARRAY['Node.js', 'PostgreSQL', 'Clean Architecture', 'RESTful API', 'Testing & CI/CD'],
          2
        );
      `)
      console.log('Default certificates seeded.')
    }

    await client.query('COMMIT')
    console.log('Migrations completed successfully!')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
