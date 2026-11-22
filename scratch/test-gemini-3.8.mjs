import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs"

const envFile = fs.readFileSync(".env", "utf8")
const env = {}
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=")
  if (k && v.length) env[k.trim()] = v.join("=").trim()
})

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" })
const res = await model.generateContent("Halo, siapa kamu?")
console.log("Success! Response:", res.response.text())
