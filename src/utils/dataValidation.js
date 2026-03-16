/**
 * Utility for data validation and normalization of project social data.
 */

/**
 * Validates a record from the XLSX.
 * @param {Object} record - Raw record from XLSX.
 * @param {Set<string>} rjMunicipalities - Set of valid RJ municipalities.
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateRecord = (record, rjMunicipalities) => {
  const errors = [];

  // Required fields: nome, endereco or municipio
  if (!record.nome && !record.Nome) {
    errors.push('Nome é obrigatório.');
  }

  const municipio = record.municipio || record.Municipio || record.Município;
  const endereco = record.endereco || record.Endereco || record.Endereço;

  if (!municipio && !endereco) {
    errors.push('Município ou Endereço é obrigatório.');
  }

  // Lat/Long validation (if present)
  const lat = record.latitude || record.Latitude || record.lat || record.Lat;
  const lng = record.longitude || record.Longitude || record.lng || record.Lng || record.lon || record.Lon;

  if (lat !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
    errors.push('Latitude inválida.');
  }
  if (lng !== undefined && (isNaN(lng) || lng < -180 || lng > 180)) {
    errors.push('Longitude inválida.');
  }

  // Municipality validation
  if (municipio && rjMunicipalities.size > 0) {
    const normalizedMun = municipio.toString().trim();
    const exists = Array.from(rjMunicipalities).some(
      (m) => m.toLowerCase() === normalizedMun.toLowerCase()
    );
    if (!exists) {
      errors.push(`Município "${normalizedMun}" não pertence ao Estado do Rio de Janeiro.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Normalizes the raw data into the project's standard format.
 * @param {Object[]} rawData - Array of raw records from XLSX.
 * @param {Object} options - Configuration options (valid municipalities).
 * @returns {Object} { data: normalizedData, inconsistencies: inconsistencyReport }
 */
export const normalizeAndValidateData = (rawData, { rjMunicipalities = new Set() } = {}) => {
  const normalizedData = [];
  const inconsistencies = [];
  const nameMap = new Map(); // To track duplicates

  rawData.forEach((record, index) => {
    const { isValid, errors } = validateRecord(record, rjMunicipalities);
    
    if (!isValid) {
      inconsistencies.push({
        row: index + 2, // Excel row reference (header is 1)
        record,
        errors,
      });
    }

    // Normalization
    const nome = record.nome || record.Nome || 'N/A';
    const municipio = record.municipio || record.Municipio || record.Município || '';
    const endereco = record.endereco || record.Endereco || record.Endereço || '';
    const lat = record.latitude || record.Latitude || record.lat || record.Lat || null;
    const lng = record.longitude || record.Longitude || record.lng || record.Lng || record.lon || record.Lon || null;

    const normalizedRecord = {
      id: record.id || `rec_${index}`,
      nome,
      endereco,
      municipio,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      projeto: "Projeto 60+",
      pessoa_em_multiplos_projetos: false, // Will be set after duplicate check
      _rawIndex: index
    };

    // Duplicate check logic: simple name-based check for now
    if (nameMap.has(nome)) {
      const firstIndex = nameMap.get(nome);
      normalizedData[firstIndex].pessoa_em_multiplos_projetos = true;
      normalizedRecord.pessoa_em_multiplos_projetos = true;
    } else {
      nameMap.set(nome, normalizedData.length);
    }

    normalizedData.push(normalizedRecord);
  });

  return {
    data: normalizedData,
    inconsistencies,
  };
};
