import React, { useState, useEffect } from "react";
import { fetchMarvelMovies } from "./services/api";
import { fetchMarvelCharacters } from "./services/characterApi";
import { Movie } from "./types/movie";
import { MarvelCharacters } from "./types/character";
import MovieCard from "./components/MovieCard";
import MovieDetails from "./components/MovieDetails";
import CharacterDetails from "./components/CharacterDetails";
import SearchFilter from "./components/SearchFilter";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import MarvelTimeline from "./components/MarvelsHistoria";
import CharactersPage from "./components/CharactersPage";
import "./App.css";
import "./css/Navbar.css";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("chronology");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<MarvelCharacters | null>(null);

  useEffect(() => {
    const getMovies = async () => {
      try {
        setLoading(true);
        const fetchedMovies = await fetchMarvelMovies();
    
        console.log('Fetchade filmer:', fetchedMovies); // Lägg till denna logg
    
        if (!Array.isArray(fetchedMovies)) {
          setError("API:t returnerade inget giltigt format.");
          return;
        }
    
        if (fetchedMovies.length === 0) {
          setError("Inga filmer hittades. API:et kan vara nere.");
        } else {
          setMovies(fetchedMovies);
        }
    
      } catch (err) {
        console.error('Fullständigt fel:', err);
        setError("Ett fel uppstod vid hämtning av filmer.");
      } finally {
        setLoading(false);
      }
    };
    
    getMovies();
  }, []);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setSelectedCharacter(null); // Stäng karaktärsdetaljerna om öppna
  };

  const handleCharacterClick = (character: MarvelCharacters) => {
    setSelectedCharacter(character);
    setSelectedMovie(null); // Stäng filmdetaljerna
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
  };
  
  const handleCloseCharacterDetails = () => {
    setSelectedCharacter(null);
  };

  // Beräkna genomsnittsbetyg
  const calculateAverageRating = (movie: Movie): number | null => {
    const ratings = [
      movie.imdb_rating,
      movie.rt_rating ? movie.rt_rating / 10 : null,
      movie.mc_rating ? movie.mc_rating / 10 : null
    ].filter((rating): rating is number => rating !== null && rating !== undefined);
    
    if (ratings.length === 0) return null;
    
    return parseFloat((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1));
  };

  // Filtrera filmer
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = selectedPhase === null || movie.phase === selectedPhase;
    const averageRating = calculateAverageRating(movie);
    
    const matchesRating = selectedRating === null || 
      (averageRating !== null && averageRating >= selectedRating);

    return matchesSearch && matchesPhase && matchesRating;
  });

  // Sortera filmer
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (sortBy) {
      case "chronology":
        return a.chronology - b.chronology;
      case "title":
        return a.title.localeCompare(b.title);
      case "rating": {
        const ratingA = calculateAverageRating(a) || 0;
        const ratingB = calculateAverageRating(b) || 0;
        return ratingB - ratingA;
      }
      case "release":
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      default:
        return 0;
    }
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 512);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 512);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  

  // Hämta unika faser
  const phases = [...new Set(movies.map(movie => movie.phase))].sort();

  return (
    <Router>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={
            <div className="app-container">
              <header className="characters-hero">
                <p className="text">
                  <span className="big-span">Marvelous RATINGS <br /></span>
                  Välkommen till Marvelous Ratings - din ultimata guide till Marvel-filmer!<br />
                  Här hittar du de senaste betygen och recensionerna från IMDb, Rotten Tomatoes och Metacritic, allt på ett ställe. Enkelt. Episkt.<br />
                  Utforska Marvel-universumet och hitta nästa film att uppleva!<br />
                  <br /> Allt samlat, allt Marvel, MARVELOUS!
                </p>
              </header>

              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedPhase={selectedPhase}
                onPhaseChange={setSelectedPhase}
                phases={phases}
                selectedRating={selectedRating}
                onRatingChange={setSelectedRating}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

              <main>
                {loading && (
                  <>
                    <section className="status-message">
                      <output className="loading" role="status" aria-live="polite">
                        <span className="loading-spinner"></span>
                        <p>Laddar filmer...</p>
                      </output>
                    </section>

                    <section className="movie-grid"> 
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="ghost-card" aria-hidden="true" />
                      ))}
                    </section>
                  </>
                )}

                {error && (
                  <section className="status-message">
                    <output className="error" role="alert">
                      <h2>Ett fel uppstod</h2>
                      <p>{error}</p>
                    </output>
                  </section>
                )}

                {!loading && !error && (
                  <section className="movies-section" style={{ marginTop: isMobile ? '100px' : '0' }}>
                    <output className="movies-count" aria-live="polite">
                      Visar {sortedMovies.length} av {movies.length} filmer
                    </output>

                    {sortedMovies.length === 0 ? (
                      <p className="no-results">Inga filmer matchade dina sökkriterier.</p>
                    ) : (
                      <section className="movie-grid" role="feed" aria-busy="false">
                        {sortedMovies.map(movie => (
                          <MovieCard
                            key={movie.id}
                            movie={movie}
                            onClick={handleMovieClick}
                          />
                        ))}
                      </section>
                    )}
                  </section>
                )}
              </main>

              {selectedMovie && (
                <MovieDetails
                  movie={selectedMovie}
                  movies={movies} // Lägg till denna rad
                  onClose={handleCloseDetails}
                  onCharacterClick={handleCharacterClick}
                />
              )}
              
              {selectedCharacter && (
                <CharacterDetails
                  character={selectedCharacter}
                  onClose={handleCloseCharacterDetails}
                  movies={movies}
                  onMovieClick={handleMovieClick}
                />
              )}

              <footer>
                <p>Data hämtad från MCU API &copy; <time dateTime={new Date().getFullYear().toString()}>{new Date().getFullYear()}</time> Marvel Filmvisare</p>
              </footer>
            </div>
          }
        />
        <Route path="/marvel-timeline" element={<MarvelTimeline />} />
        <Route path="/characters" element={<CharactersPage />} />
      </Routes>
    </Router>
  );
}

export default App;