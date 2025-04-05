import { Movie } from '../types/movie';

export const fetchMarvelMovies = async (): Promise<Movie[]> => {
  try {
    console.log("🎬 Försöker hämta filmer från /marvelmovies.json...");
    
    const response = await fetch('/marvelmovies.json', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: Movie[] = await response.json();
    
    console.log(`🎬 Hämtade ${data.length} filmer från lokal JSON-fil`);
    
    // Validera filmer
    const validMovies = data.filter(movie => {
      const isValid = !!(
        movie.id && 
        movie.title && 
        movie.release_date &&
        movie.imdb_rating !== undefined
      );
      
      if (!isValid) {
        console.warn('Ogiltig film hittades:', movie);
      }
      
      return isValid;
    });
    
    console.log(`Filmer med betyg: ${validMovies.length} av ${data.length}`);
    
    return validMovies;
    
  } catch (error) {
    console.error("❌ Fel vid hämtning av filmer:", error);
    throw error;
  }
};