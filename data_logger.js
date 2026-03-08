import express from "express"
import { createClient } from "@supabase/supabase-js"

const app = express()
app.use(express.json())

const supabase = createClient(
  "https://jsusmmsnkzdymiznmtsj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzdXNtbXNua3pkeW1pem5tdHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzgzMzYsImV4cCI6MjA4ODE1NDMzNn0.bM0f5dp4t1HiFZLL3EDbL74sXsx0tjw498ZbwIWqJ8Q"
)

app.post("/raw_logs", async (req, res) => {

  console.log("HEADERS:", req.headers)
  console.log("BODY:", req.body)

  const payload = req.body
  const imei = payload?.data?.imei || payload?.imei

  if (!imei) {
    return res.status(400).json({ error: "IMEI missing" })
  }

  // Find device_id using IMEI
  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("id")
    .eq("imei_no", imei)
    .single()

  if (deviceError || !device) {
    return res.status(404).json({ error: "Device not registered" })
  }

  // Insert raw JSON log
  const { error } = await supabase
    .from("raw_logs")
    .insert({
      device_id: device.id,
      payload: payload
    })

  if (error) {
    return res.status(500).json(error)
  }

  res.json({ status: "log stored" })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
