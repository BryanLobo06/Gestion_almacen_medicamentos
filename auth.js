import { pool } from "./connection_db.js";

async function getUserByUsername(username) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE users = ? LIMIT 1",
    [username]
  );

  if (rows.length === 0) {
    return null; // no existe el usuario
  }

  return rows[0]; // devuelve el usuario encontrado
}

export { getUserByUsername };
