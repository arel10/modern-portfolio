import fs from "fs"

const envFile = fs.readFileSync(".env", "utf8")
const env = {}
envFile.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=")
  if (k && v.length) env[k.trim()] = v.join("=").trim()
})

const apiKey = env.GEMINI_API_KEY
console.log("Key:", apiKey.substring(0, 6) + "...")

try {
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  const data = await resp.json()
  console.log("List models status:", resp.status)
  if (data.models) {
    console.log("Available models:", data.models.slice(0, 5).map(m => m.name))
  } else {
    console.log("Response:", JSON.stringify(data, null, 2))
  }
} catch (e) {
  console.error("Fetch error:", e.message)
}
