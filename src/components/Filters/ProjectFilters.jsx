import React from 'react';
import { Search, Filter, AlertCircle } from 'lucide-react';

export const ProjectFilters = ({ 
  filters, 
  setFilters, 
  municipalities, 
  inconsistenciesCount 
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 font-bold text-gray-700 border-b pb-2">
        <Filter size={18} />
        <span>Filtros do Projeto</span>
      </div>

      {/* Busca por Nome */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
          <Search size={14} /> Busca por Nome
        </label>
        <input
          type="text"
          name="nameSearch"
          value={filters.nameSearch}
          onChange={handleChange}
          placeholder="Digite um nome..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Município */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Município</label>
        <select
          name="municipality"
          value={filters.municipality}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Todos os Municípios</option>
          {municipalities.sort().map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Multiplos Projetos */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="multiProjects"
          name="showOnlyMulti"
          checked={filters.showOnlyMulti}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="multiProjects" className="text-sm font-medium text-gray-600 cursor-pointer">
          Apenas múltiplos projetos
        </label>
      </div>

      {/* Report Summary */}
      {inconsistenciesCount > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-xs text-red-700">
            <p className="font-bold">Inconsistências detectadas</p>
            <p>{inconsistenciesCount} registros com problemas de validação.</p>
          </div>
        </div>
      )}
    </div>
  );
};
