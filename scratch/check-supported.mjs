import fs from "fs"

const envFile = fs.readFileSync(".env", "utf8")
const env = {}
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=")
  if (k && v.length) env[k.trim()] = v.join("=").trim()
})

const apiKey = env.GEMINI_API_KEY
const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
const data = await resp.json()
for (const m of (data.models || [])) {
  if (m.supportedGenerationMethods?.includes("generateContent")) {
    console.log(m.name, m.displayName)
  }
}
