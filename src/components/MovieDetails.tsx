import React, { useEffect, useRef, useState } from 'react';
import { Movie } from '../types/movie';
import { MarvelCharacters } from '../types/character';
import '../css/MovieDetails.css';
import { fetchMarvelCharacters } from '../services/characterApi';

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  onCharacterClick?: (character: MarvelCharacters) => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose, onCharacterClick }) => {
  const [characters, setCharacters] = useState<MarvelCharacters[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hämta karaktärer när komponenten laddas
  useEffect(() => {
    const getCharacters = async () => {
      try {
        const allCharacters = await fetchMarvelCharacters();
        setCharacters(allCharacters);
      } catch (error) {
        console.error('Fel vid hämtning av karaktärer:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getCharacters();
  }, []);
  
  // Filtrera karaktärer som medverkar i den aktuella filmen
  const charactersInMovie = characters.filter(character => 
    character.movies.some(movieTitle => 
      movieTitle.includes(movie.title) || movie.title.includes(movieTitle.split(' (')[0])
    )
  );
  
  // Formatera releasedatum till läsbart format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('sv-SE', options);
  };

  // Refs och event listeners för modal
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Formatera speltid
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Hämta årtalet från releasedatum
  const getReleaseYear = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  // Kontrollera om filmen har släppts
  const isMovieReleased = (releaseDate: string): boolean => {
    const today = new Date();
    const releaseDay = new Date(releaseDate);
    return releaseDay <= today;
  };

  // Förhindra scrollning
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleClose = () => {
    document.body.classList.remove('modal-open');
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  // Hantera klick på en karaktär
  const handleCharacterCardClick = (character: MarvelCharacters) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Förhindra att modal stängs
    if (onCharacterClick) {
      onCharacterClick(character);
      onClose(); // Stäng filmdetaljer när man öppnar karaktärsdetaljer
    }
  };

  // Fiktiva genres
  const genres = ['Sci-Fi', 'Superhero', 'Action', 'Adventure'];

  // Beräkna genomsnittsbetyg från filmens befintliga data
  const calculateAverageRating = (): number | null => {
    const ratings = [
      movie.imdb_rating,
      movie.rt_rating ? movie.rt_rating / 10 : null,
      movie.mc_rating ? movie.mc_rating / 10 : null
    ].filter((rating): rating is number => rating !== null && rating !== undefined);

    if (ratings.length === 0) return null;

    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return parseFloat(averageRating.toFixed(1));
  };

  const ratingValue = calculateAverageRating();

  return (
    <aside 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="movie-title"
      onClick={handleClose}
    >
      <article className="movie-details" onClick={handleModalClick} ref={modalRef}>
        {/* Stängningsknapp */}
        <button className="close-button" onClick={handleClose} aria-label="Stäng detaljer">
          ×
        </button>
        
        {/* Bakgrundsbild med blur */}
        {movie.cover_url && (
          <div 
            className="details-background" 
            style={{ backgroundImage: `url(${movie.cover_url})` }} 
            aria-hidden="true"
          />
        )}

        {/* Filmpostern överst */}
        <div className="details-top-section">
          <figure className="details-poster">
            {movie.cover_url ? (
              <img src={movie.cover_url} alt={`Filmposter för ${movie.title}`} />
            ) : (
              <figcaption className="no-poster">Ingen bild tillgänglig</figcaption>
            )}
          </figure>
        </div>

        {/* Titel och metadata med integrerad betygssektion */}
        <header className="details-header">
          <h2 id="movie-title">{movie.title}</h2>
          
          {/* Visa genomsnittsbetyget uppe till höger */}
          {isMovieReleased(movie.release_date) && ratingValue && (
            <div className="average-rating">
              {ratingValue.toFixed(1)}/10
            </div>
          )}
          
          <div className="movie-meta">
            <span className="movie-year">{getReleaseYear(movie.release_date)}</span>
            {"|"}
            <span className="movie-duration">{formatDuration(movie.duration)}</span>
          </div>

          <div className="genre-tags">
            {genres.map(genre => (
              <span key={genre} className="genre-tag">{genre}</span>
            ))}
          </div>

          <div className="genre-tags">
            {movie.saga && (
                <span className="phase-tag">{movie.saga}</span>
              )}
          </div>
        </header>

        {/* Betygssektion - nu med data från JSON */}
        <section className="ratings-section">
          <h3 className="section-title">Betyg</h3>

          {isMovieReleased(movie.release_date) ? (
          <div className="ratings-container-inline">
            {movie.imdb_rating && (
              <div className="rating-badge">
                <h4>IMDB</h4>
                <span className="rating-icon">⭐</span>
                <span className="rating-value">{Number(movie.imdb_rating).toFixed(1)}</span>
              </div>
            )}
            
            {movie.rt_rating && (
              <div className="rating-badge">
                <h4>Rotten Tomatoes</h4>
                <span className="rating-icon">🍅</span>
                <span className="rating-value">{Number(movie.rt_rating)}%</span>
              </div>
            )}
            
            {movie.mc_rating && (
              <div className="rating-badge">
                <h4>Metacritic</h4>
                <span className="rating-icon">📊</span>
                <span className="rating-value">{Number(movie.mc_rating)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="coming-soon">
            <p>Coming soon...</p>
          </div>
        )}
        </section>
        
        {/* Övrig information från databasen */}
        <section className="about-movie-section">
          <div className="section-divider"></div>
          <h3 className="section-title">About the movie</h3>
          <p>{movie.overview || "Ingen beskrivning tillgänglig."}</p>
        </section>

        {/* Trailer-sektion */}
        {movie.trailer_url && (
          <section className="trailer-section">
            <h3 className="section-title">Trailer</h3>
            <figure className="trailer-container">
              <iframe
                src={movie.trailer_url.replace('watch?v=', 'embed/')}
                title={`${movie.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </figure>
          </section>
        )}
        
        {/* Karaktärssektion */}
        {!loading && charactersInMovie.length > 0 && (
          <section className="characters-section">
            <div className="section-divider"></div>
            <h3 className="section-title">Karaktärer i filmen</h3>
            
            <div className="movie-characters-grid">
              {charactersInMovie.map((character) => (
                <div 
                  key={character.id} 
                  className="movie-character-card"
                  onClick={onCharacterClick ? handleCharacterCardClick(character) : undefined}
                  style={onCharacterClick ? { cursor: 'pointer' } : {}}
                >
                  <div className="character-avatar-container">
                    <img 
                      src={character.image_url} 
                      alt={character.name} 
                      className="character-avatar"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-character.jpg';
                      }}
                    />
                  </div>
                  <h4 className="character-name">{character.name}</h4>
                  {character.real_name !== character.name && (
                    <p className="character-real-name">{character.real_name}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </aside>
  );
};

export default MovieDetails;