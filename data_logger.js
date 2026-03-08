import express from "express"
import { createClient } from "@supabase/supabase-js"

const app = express()
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

app.post("/raw_logs", async (req, res) => {

  const payload = req.body
  payload?.data?.imei

  if (!imei) {
    return res.status(400).json({ error: "IMEI missing" })
  }

  const { data: device } = await supabase
    .from("devices")
    .select("id")
    .eq("imei_no", imei)
    .single()

  if (!device) {
    return res.status(404).json({ error: "Device not registered" })
  }

  const { error } = await supabase
    .from("raw_logs")
    .insert({
      device_id: device.id,
      payload: payload
    })

  if (error) {
    return res.status(500).json({ error })
  }

  res.json({ status: "log stored" })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
