import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

// Debug raw body
app.use((req, res, next) => {
  let raw = "";

  req.on("data", chunk => {
    raw += chunk;
  });

  req.on("end", () => {
    console.log("RAW BODY:", raw);
  });

  next();
});

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.post("/raw_logs", async (req, res) => {

  console.log("Incoming body:", req.body);

  const payload = req.body;
  const imei = payload?.data?.imei;

  if (!imei) {
    return res.status(400).json({ error: "IMEI missing" });
  }

  const { data: device, error: deviceError } = await supabase
    .from("devices")
    .select("id")
    .eq("imei_no", imei)
    .single();

  if (deviceError || !device) {
    return res.status(404).json({ error: "Device not registered" });
  }

  const { data, error } = await supabase
    .from("raw_logs")
    .insert({
      device_id: device.id,
      payload: payload
    })
    .select();

  console.log("Insert DATA:", data);
  console.log("Insert ERROR:", error);

  if (error) {
    return res.status(500).json({ error });
  }

  res.json({ status: "log stored" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
