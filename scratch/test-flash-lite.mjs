import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs"

const envFile = fs.readFileSync(".env", "utf8")
const env = {}
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=")
  if (k && v.length) env[k.trim()] = v.join("=").trim()
})

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
const m = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" })
const res = await m.generateContent("Halo, kenalkan diri kamu dalam 1 kalimat!")
console.log("Response:", res.response.text())
