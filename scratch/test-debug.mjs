import { GoogleGenerativeAI } from "@google/generative-ai"
import { Pool } from "pg"
import fs from "fs"

// Baca .env
const envFile = fs.readFileSync(".env", "utf8")
const env = {}
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=")
  if (k && v.length) env[k.trim()] = v.join("=").trim()
})

console.log("Testing with GEMINI_API_KEY:", env.GEMINI_API_KEY ? "Found key length: " + env.GEMINI_API_KEY.length : "Not found")

// Test Gemini
try {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL || "gemini-1.5-flash" })
  console.log("Sending prompt to Gemini...")
  const res = await model.generateContent("Halo, tes 123")
  console.log("Gemini response:", res.response.text())
} catch (err) {
  console.error("Gemini Error:", err.message)
}

// Test PG
try {
  console.log("Testing PostgreSQL connection to:", env.DATABASE_URL)
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 3000,
  })
  const client = await pool.connect()
  console.log("PG Connected successfully!")
  client.release()
  await pool.end()
} catch (err) {
  console.error("PostgreSQL Error:", err.message)
}
