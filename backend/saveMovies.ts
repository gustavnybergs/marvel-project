import axios from "axios";
import { executeQuery } from "../api/db";
import { Movie } from "../src/types/movie";

// Interface för OMDb API-svar
interface OMDbResponse {
  Response: string;
  imdbRating?: string;
  Ratings?: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore?: string;
}

// OMDb API-nyckel
const OMDB_API_KEY = "8f57b2c1";

export async function fetchAndSaveMovies() {
  try {
    // Steg 1: Hämta grunddata från MCU API (som innan)
    console.log("Hämtar filmer från MCU API...");
    const response = await axios.get<{ data: Movie[] }>("https://mcuapi.herokuapp.com/api/v1/movies");
    const movies: Movie[] = response.data.data;
    console.log(`Hämtade ${movies.length} filmer från MCU API`);
    
    // Steg 2: Berika med betyg från OMDb
    const enrichedMovies = [];
    
    for (const movie of movies) {
      console.log(`Bearbetar film: ${movie.title}`);
      
      // Hämta betyg från OMDb API
      let imdb_rating = null;
      let rt_rating = null;
      let mc_rating = null;
      
      try {
        // Använd filmens titel och år för sökning
        const year = new Date(movie.release_date).getFullYear();
        const query = encodeURIComponent(movie.title);
        
        console.log(`Söker efter "${movie.title}" (${year}) på OMDb...`);
        const omdbResponse = await axios.get<OMDbResponse>(`https://www.omdbapi.com/?t=${query}&y=${year}&apikey=${OMDB_API_KEY}`);
        
        const data = omdbResponse.data;
        if (data && data.Response === "True") {
          // Hämta IMDb-betyg
          if (data.imdbRating && data.imdbRating !== "N/A") {
            imdb_rating = parseFloat(data.imdbRating);
          }
          
          // Hämta övriga betyg från Ratings-arrayen
          if (data.Ratings && Array.isArray(data.Ratings)) {
            for (const rating of data.Ratings) {
              if (rating.Source === "Rotten Tomatoes" && rating.Value) {
                // Konvertera "75%" till 75
                rt_rating = parseInt(rating.Value.replace("%", ""));
              } else if (rating.Source === "Metacritic" && rating.Value) {
                // Konvertera "75/100" till 75
                mc_rating = parseInt(rating.Value.split("/")[0]);
              }
            }
          }
          
          console.log(`Betyg för "${movie.title}": IMDb: ${imdb_rating}, RT: ${rt_rating}, MC: ${mc_rating}`);
        } else {
          console.log(`Ingen träff på OMDb för "${movie.title}"`);
        }
      } catch (error: any) {
        console.error(`Fel vid hämtning av betyg för "${movie.title}":`, error.message);
      }
      
      // Vänta lite så vi inte överbelastar API:et (max 1000 req/dag)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Lägg till betyg till filmen
      enrichedMovies.push({
        ...movie,
        imdb_rating,
        rt_rating,
        mc_rating
      });
    }
    
    // Resten av koden förblir oförändrad...
  } catch (error) {
    console.error("Fel vid hämtning eller sparning av filmer:", error);
  }
}

// Kör funktionen direkt när scriptet körs
fetchAndSaveMovies().then(() => {
  console.log("Script avslutat.");
  process.exit(0);
}).catch((error) => {
  console.error("Fel vid körning av skriptet:", error);
  process.exit(1);
});