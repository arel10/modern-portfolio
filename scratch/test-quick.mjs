import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs"

const envFile = fs.readFileSync(".env", "utf8")
const env = {}
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=")
  if (k && v.length) env[k.trim()] = v.join("=").trim()
})

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
const testModels = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.5-flash-lite"]

for (const m of testModels) {
  try {
    const model = genAI.getGenerativeModel({ model: m })
    const res = await model.generateContent("Hai!")
    console.log(`Model ${m} SUCCESS:`, res.response.text().trim().substring(0, 50))
    break
  } catch (e) {
    console.log(`Model ${m} FAILED:`, e.message)
  }
}
