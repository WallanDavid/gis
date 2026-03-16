import { useState, useEffect, useMemo } from 'react';
import { loadLocalXlsx } from '../services/dataIngestion';
import { normalizeAndValidateData } from '../utils/dataValidation';
import municipiosGeoJson from '../data/municipios.json';

/**
 * Hook to manage data from "Projeto 60+".
 */
export const useReabilita60 = () => {
  const [rawData, setRawData] = useState([]);
  const [normalizedData, setNormalizedData] = useState([]);
  const [inconsistencies, setInconsistencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract valid RJ municipalities from GeoJSON
  const rjMunicipalities = useMemo(() => {
    return new Set(municipiosGeoJson.features.map(f => f.properties.name));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Assume file is in public folder after build or available via fetch
        const data = await loadLocalXlsx('/reabilita60-alunos.xlsx');
        setRawData(data);
        
        const { data: normalized, inconsistencies: report } = normalizeAndValidateData(data, {
          rjMunicipalities
        });
        
        setNormalizedData(normalized);
        setInconsistencies(report);
      } catch (err) {
        console.error('Erro ao carregar Projeto 60+:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rjMunicipalities]);

  return {
    rawData,
    normalizedData,
    inconsistencies,
    loading,
    error,
    rjMunicipalities: Array.from(rjMunicipalities),
  };
};
