import React from 'react';
import { Popup } from 'react-leaflet';

export const PersonPopup = ({ person }) => {
  return (
    <Popup>
      <div className="p-1">
        <h3 className="font-bold text-lg mb-1">{person.nome}</h3>
        <p className="text-sm"><strong>Projeto:</strong> {person.projeto}</p>
        <p className="text-sm"><strong>Município:</strong> {person.municipio}</p>
        <p className="text-sm"><strong>Endereço:</strong> {person.endereco || 'N/A'}</p>
        {person.pessoa_em_multiplos_projetos && (
          <div className="mt-2 p-1 bg-yellow-100 border border-yellow-400 rounded text-xs text-yellow-800 font-semibold">
            ⚠️ Participa de múltiplos projetos
          </div>
        )}
      </div>
    </Popup>
  );
};
