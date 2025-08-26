import express from "express";
import cors from "cors";
import { getUserByUsername } from "./auth.js";

const app = express();

// ✅ habilitar CORS para todos los orígenes (desarrollo)
app.use(cors());

app.use(express.json());

// ruta de login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByUsername(email);

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    if (user.passwords !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({ message: "Login exitoso", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000 ✅");
});
