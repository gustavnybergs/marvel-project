import React, { useEffect, useRef, useState } from 'react';
import { MarvelCharacters } from '../types/character';
import { Movie } from '../types/movie';
import '../css/CharacterDetails.css';

interface CharacterDetailsProps {
  character: MarvelCharacters;
  onClose: () => void;
  movies?: Movie[]; // Alla filmer från applikationen
  onMovieClick?: (movie: Movie) => void; // Funktion för att hantera filmklick
}

const CharacterDetails: React.FC<CharacterDetailsProps> = ({ 
  character, 
  onClose,
  movies = [], // Default till tom array om inga filmer skickas in
  onMovieClick 
}) => {
  // Fallback-bild om image_url saknas eller är felaktig
  const defaultImage = '/placeholder-character.jpg';
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Hämta filmer som karaktären medverkar i
  const getMoviesForCharacter = (characterMovies: string[], allMovies: Movie[]): Movie[] => {
    // Filtrerar filmer som matchar namn i karaktärens movies-array
    return allMovies.filter(movie => 
      characterMovies.some(movieTitle => 
        // Matcha även om filmtiteln innehåller extra text i parentes, t.ex. "(post-credits)"
        movieTitle.includes(movie.title) || movie.title.includes(movieTitle.split(' (')[0])
      )
    );
  };
  
  // Hämta filmerna för denna karaktär
  const characterMovies = getMoviesForCharacter(character.movies, movies);
  
  useEffect(() => {
    // Förhindra scrollning på sidan när detaljvyn är öppen
    document.body.classList.add('modal-open');
    
    // Lägg till en eventlistener för att stänga detaljer när man klickar utanför
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Återställ när komponenten avmonteras
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = defaultImage;
  };

  const handleClose = () => {
    document.body.classList.remove('modal-open');
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Hantera klick på en film
  const handleMovieCardClick = (movie: Movie) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Förhindra att modal stängs
    if (onMovieClick) {
      onMovieClick(movie);
      onClose(); // Stäng karaktärsdetaljer när man öppnar filmdetaljer
    }
  };

  const characterTags = ['Avenger', 'Hero', 'Mutant', 'Warrior'];

  return (
    <aside 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="character-title"
      onClick={handleClose}
    >
      <article className="character-details" onClick={handleModalClick} ref={modalRef}>
        {/* Stängningsknapp - bara en, högst upp till höger */}
        <button className="close-button" onClick={handleClose} aria-label="Stäng detaljer">
          ×
        </button>
        
        {/* Bakgrundsbild med blur */}
        {character.image_url && (
          <div 
            className="details-background" 
            style={{ backgroundImage: `url(${character.image_url})` }} 
            aria-hidden="true"
          />
        )}

        {/* Karaktärsbilden överst */}
        <div className="details-top-section">
          <figure className="details-poster">
            {character.image_url ? (
              <img 
                src={character.image_url} 
                alt={`Bild på ${character.name}`}
                onError={handleImageError}
              />
            ) : (
              <figcaption className="no-poster">Ingen bild tillgänglig</figcaption>
            )}
          </figure>
        </div>

        {/* Titel och metadata */}
        <header className="details-header">
          <h2 id="character-title">{character.name}</h2>
          
          <div className="character-meta">
            {character.real_name && (
              <span className="character-real-name">{character.real_name}</span>
            )}
          </div>

          <div className="genre-tags">
            {characterTags.map(tag => (
              <span key={tag} className="genre-tag">{tag}</span>
            ))}
          </div>
        </header>

        {/* Beskrivning */}
        {character.description && (
          <section className="about-character-section">
            <div className="section-divider"></div>
            <h3 className="section-title">Om karaktären</h3>
            <p>{character.description}</p>
          </section>
        )}

        {/* Filmer karaktären medverkar i - nu klickbara */}
        {characterMovies.length > 0 && (
          <section className="movies-section">
            <div className="section-divider"></div>
            <h3 className="section-title">Medverkar i</h3>
            
            <div className="character-movies-grid">
              {characterMovies.map((movie) => (
                <div 
                  key={movie.id} 
                  className="character-movie-card"
                  onClick={onMovieClick ? handleMovieCardClick(movie) : undefined}
                  style={onMovieClick ? { cursor: 'pointer' } : {}}
                >
                  <div className="movie-poster-container">
                    <img 
                      src={movie.cover_url} 
                      alt={`Poster för ${movie.title}`} 
                      className="movie-poster"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/headerbild.svg';
                      }}
                    />
                  </div>
                  <h4 className="movie-title">{movie.title}</h4>
                  <p className="movie-year">
                    {new Date(movie.release_date).getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Footer */}
        <footer className="details-footer">
          <p className="data-source">Data hämtad från Marvel API</p>
        </footer>
      </article>
    </aside>
  );
};

export default CharacterDetails;