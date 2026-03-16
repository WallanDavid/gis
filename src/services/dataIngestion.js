import * as XLSX from 'xlsx';

/**
 * Service to handle data ingestion from XLSX files.
 */
export const parseXlsxFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo XLSX: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Alternative for loading local file via fetch if in public folder or assets.
 */
export const loadLocalXlsx = async (url) => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    throw new Error('Erro ao carregar arquivo XLSX local: ' + error.message);
  }
};
