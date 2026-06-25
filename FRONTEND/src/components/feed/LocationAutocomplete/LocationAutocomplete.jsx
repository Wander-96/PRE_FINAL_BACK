import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import './LocationAutocomplete.css';

export const LocationAutocomplete = ({ value, onChange, disabled }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  // Cierra el dropdown si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync prop to state if it changes externally
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const searchLocation = async (searchText) => {
    if (!searchText.trim() || searchText.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5`, {
        headers: {
          'Accept-Language': 'es,en' // Para tener resultados preferentemente en español o inglés
        }
      });
      const data = await res.json();
      
      const formattedSuggestions = data.map(item => {
        // Nominatim devuelve display_name que suele ser muy largo, tratamos de limpiarlo
        const parts = item.display_name.split(', ');
        // Tomamos ciudad, provincia, pais (hasta 3 partes)
        return parts.slice(0, 3).join(', ');
      });
      
      // Eliminar duplicados simples
      const uniqueSuggestions = [...new Set(formattedSuggestions)];
      setSuggestions(uniqueSuggestions);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // Notifica al componente padre
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
      searchLocation(val);
    }, 500); // 500ms debounce
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion);
    onChange(suggestion);
    setShowDropdown(false);
  };

  return (
    <div className="location-autocomplete-container" ref={dropdownRef}>
      <div className="location-input-wrapper">
        <MapPin size={16} className="location-icon" />
        <input 
          type="text" 
          placeholder="Add location (e.g. Buenos Aires, Argentina)"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if(suggestions.length > 0) setShowDropdown(true); }}
          disabled={disabled}
          className="location-input"
          autoFocus
        />
        {isLoading && <span className="location-loading-spinner">...</span>}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="location-dropdown">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              className="location-dropdown-item"
              onClick={() => handleSelect(suggestion)}
            >
              <Search size={14} className="location-dropdown-icon" />
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
