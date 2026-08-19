import { databaseStatus } from "../config/database.js";

export function getHealth(_request, response) {
  response.json({ status: "ok", database: databaseStatus() });
}
