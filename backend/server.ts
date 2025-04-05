import express from "express";
import cors from "cors";
import axios from "axios";
import { executeQuery } from "../api/db";

const app = express();
const PORT = process.env.PORT || 3001;

const SUPERHERO_API_KEY = '9027e21be002c76e7e0e21003c796431';

app.use(cors());

app.get("/api/movies", async (req, res) => {
  try {
    // Anslut till databasen och hämta filmer
    console.log("Hämtar filmer från databasen...");
    const rows = await executeQuery("SELECT * FROM movies");
    
    console.log(`Hittade ${rows.length} filmer i databasen`);
    
    // Skicka svar till frontend
    res.json({
      data: rows,
      total: rows.length,
    });
  } catch (err: any) {
    console.error("Fel vid hämtning:", err);
    res.status(500).json({
      error: {
        message: "Något gick fel på servern",
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined
      }
    });
  }
});

// Ny route för SuperHero API proxy
app.get("/api/superhero/:id", async (req, res) => {
  try {
    const response = await axios.get(`https://superheroapi.com/api/${SUPERHERO_API_KEY}/${req.params.id}`);
    res.json(response.data);
  } catch (error: any) {
    console.error("Fel vid hämtning av superhjälte:", error);
    res.status(500).json({
      error: {
        message: "Kunde inte hämta karaktärsdata",
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servern är igång på http://localhost:${PORT}`);
});