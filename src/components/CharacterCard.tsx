import React from 'react';
import { MarvelCharacters } from '../types/character';
import '../css/CharacterCard.css';

interface CharacterCardProps {
  character: MarvelCharacters;
  onClick: (character: MarvelCharacters) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick }) => {
  // Fallback-bild om image_url saknas eller är felaktig
  const defaultImage = '/placeholder-character.jpg';
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = defaultImage;
  };

  return (
    <article className="character-card" onClick={() => onClick(character)}>
      <figure className="character-image-container">
        {character.image_url ? (
          <img 
            src={character.image_url} 
            alt={`${character.name}`}
            className="character-image"
            onError={handleImageError}
          />
        ) : (
          <div className="no-image" aria-label="Ingen bild tillgänglig">
            Ingen bild
          </div>
        )}
      </figure>
      
      <div className="character-info">
        <h2 className="character-name">{character.name}</h2>
        {character.real_name && (
          <p className="character-real-name">{character.real_name}</p>
        )}
      </div>
    </article>
  );
};

export default CharacterCard;