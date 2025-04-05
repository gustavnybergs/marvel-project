/*

// src/utils/saveMarvelCharacters.ts
import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { MarvelCharacters } from '../types/character';

const SUPERHERO_API_KEY = '9027e21be002c76e7e0e21003c796431';
const API_BASE_URL = `https://superheroapi.com/api/${SUPERHERO_API_KEY}`;

// Funktion för att vänta
const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Hämta karaktärer från ID 51 till 200
const startId = 601;
const endId = 731;
const characterIds = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);

async function fetchAndSaveMarvelCharacters(): Promise<void> {
  console.log(`Skript startat - Hämtar Marvel-karaktärer från ID ${startId} till ${endId}...`);
  
  // Först läser vi in befintliga karaktärer (om filen finns)
  let existingCharacters: MarvelCharacters[] = [];
  const outputPath = path.resolve(__dirname, '../../public/marvelcharacters.json');
  
  try {
    if (await fs.pathExists(outputPath)) {
      existingCharacters = await fs.readJson(outputPath);
      console.log(`Läste in ${existingCharacters.length} befintliga karaktärer från filen.`);
    }
  } catch (error) {
    console.warn('Kunde inte läsa in befintlig fil. Skapar en ny.');
  }
  
  const marvelCharacters: MarvelCharacters[] = [];

  for (const id of characterIds) {
    try {
      console.log(`Hämtar karaktär med ID: ${id}`);
      
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      const character = response.data;

      // Kontrollera om det är en Marvel-karaktär
      if (character.biography?.publisher === 'Marvel Comics') {
        console.log(`Hittade Marvel-karaktär: ${character.name}`);
        
        const formatted: MarvelCharacters = {
          id: Number(character.id),
          name: character.name,
          real_name: character.biography['full-name'] || character.name,
          description: character.biography['first-appearance'] || 'Ingen beskrivning tillgänglig',
          image_url: character.image?.url || '',
          movies: [] // Kan fyllas i senare
        };

        marvelCharacters.push(formatted);
      }

      // Vänta lite mellan anropen för att inte överbelasta API:et
      await wait(300);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Fel vid hämtning av karaktär med ID ${id}: ${error.message}`);
      } else {
        console.error(`Okänt fel vid hämtning av karaktär med ID ${id}`);
      }
    }
  }

  // Kombinera befintliga karaktärer med nyligen hämtade
  const allCharacters = [...existingCharacters, ...marvelCharacters];
  
  // Ta bort eventuella dubbletter baserat på ID
  const uniqueCharacters = allCharacters.filter((character, index, self) => 
    index === self.findIndex(c => c.id === character.id)
  );

  if (marvelCharacters.length > 0) {
    try {
      // Försäkrar att mappen finns
      await fs.ensureDir(path.dirname(outputPath));
      
      // Skriver JSON-filen
      await fs.writeJson(outputPath, uniqueCharacters, { spaces: 2 });
      
      console.log(`✅ Sparade ${uniqueCharacters.length} Marvel-karaktärer till public/marvelcharacters.json`);
      console.log(`✅ Denna körning hittade ${marvelCharacters.length} nya Marvel-karaktärer.`);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Fel vid sparande av JSON-fil:', error.message);
      } else {
        console.error('Okänt fel vid sparande av JSON-fil');
      }
    }
  } else {
    console.log('Inga Marvel-karaktärer hittades att spara i denna körning.');
  }
}

// Kör funktionen
fetchAndSaveMarvelCharacters().catch(error => {
  console.error('Oväntat fel:', error);
});


*/