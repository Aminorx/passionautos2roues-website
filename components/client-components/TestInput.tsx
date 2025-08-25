import React, { useState } from 'react';

export const TestInput: React.FC = () => {
  const [value, setValue] = useState('');

  return (
    <div className="p-4 border border-red-500 bg-red-50">
      <h3 className="text-red-800 font-bold mb-2">Test Input - Si celui-ci fonctionne, le problème vient d'ailleurs</h3>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          console.log('TestInput onChange:', e.target.value);
          setValue(e.target.value);
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        placeholder="Test de saisie directe"
      />
      <p className="mt-2 text-sm text-red-700">Valeur: {value}</p>
    </div>
  );
};