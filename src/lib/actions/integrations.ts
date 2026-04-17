"use server";

import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "integrations_db.json");

export async function getIntegrationsConfig() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { apps: {}, webhooks: {} };
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read integrations DB:", error);
    return { apps: {}, webhooks: {} };
  }
}

export async function saveIntegrationsConfig(config: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(config, null, 2), "utf-8");
    return { success: true };
  } catch (error) {
    console.error("Failed to write to integrations DB:", error);
    return { success: false };
  }
}
