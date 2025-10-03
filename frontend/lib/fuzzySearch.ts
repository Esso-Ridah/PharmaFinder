/**
 * Fuzzy search utilities for tolerating spelling mistakes
 */

// Calcule la distance de Levenshtein entre deux chaînes
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Calcule un score de similarité (0-1, 1 étant identique)
export function similarityScore(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
}

// Normalise une chaîne pour la recherche (supprime accents, ponctuation, etc.)
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^\w\s]/g, '') // Supprime la ponctuation
    .trim();
}

// Recherche floue dans une liste d'éléments
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string,
  threshold: number = 0.6
): Array<T & { score: number }> {
  const normalizedQuery = normalizeString(query);

  if (normalizedQuery.length === 0) {
    return items.map(item => ({ ...item, score: 1 }));
  }

  const results = items
    .map(item => {
      const searchText = normalizeString(getSearchText(item));

      // Recherche exacte d'abord
      if (searchText.includes(normalizedQuery)) {
        return { ...item, score: 1 };
      }

      // Recherche floue sur le texte complet
      let maxScore = similarityScore(normalizedQuery, searchText);

      // Recherche floue sur les mots individuels
      const queryWords = normalizedQuery.split(/\s+/);
      const textWords = searchText.split(/\s+/);

      for (const queryWord of queryWords) {
        for (const textWord of textWords) {
          const wordScore = similarityScore(queryWord, textWord);
          maxScore = Math.max(maxScore, wordScore);
        }
      }

      // Bonus pour les correspondances de début de mot
      for (const textWord of textWords) {
        if (textWord.startsWith(normalizedQuery.substring(0, 3))) {
          maxScore = Math.max(maxScore, 0.8);
        }
      }

      return { ...item, score: maxScore };
    })
    .filter(item => item.score >= threshold)
    .sort((a, b) => b.score - a.score);

  return results;
}

// Suggestions de correction d'orthographe
export function getSpellingSuggestions(
  query: string,
  dictionary: string[],
  maxSuggestions: number = 3
): string[] {
  const normalizedQuery = normalizeString(query);

  return dictionary
    .map(word => ({
      word,
      score: similarityScore(normalizedQuery, normalizeString(word))
    }))
    .filter(item => item.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(item => item.word);
}

// Dictionnaire de médicaments courants avec variantes d'orthographe
export const COMMON_MEDICATIONS = [
  'paracétamol', 'paracetamol', 'acetaminophene',
  'ibuprofène', 'ibuprofen', 'ibuprofene',
  'aspirine', 'aspirin', 'acide acetylsalicylique',
  'amoxicilline', 'amoxiciline', 'amoxycilline',
  'doliprane', 'dolipranne', 'dolipran',
  'efferalgan', 'efferalgang', 'efferalgant',
  'advil', 'adville', 'advill',
  'voltarène', 'voltaren', 'voltarene',
  'augmentin', 'augmantín', 'augmentine',
  'azithromycine', 'azithromicine', 'azytromycine',
  'clarithromycine', 'claritromycine', 'clarythromycine',
  'ciprofloxacine', 'ciprofloxacin', 'cyprofoxacine',
  'métronidazole', 'metronidazole', 'metronydazole',
  'céphalex', 'cefalexine', 'cephalexine',
  'cotrimoxazole', 'cotrimoxasole', 'co-trimoxazole',
  'atorvastatine', 'atorvastatin', 'atorvastatine',
  'lisinopril', 'lysinopril', 'lisinoprill',
  'hydrochlorothiazide', 'hydrochlorothyazide', 'hctz',
  'amlodipine', 'amlodipin', 'amlodypine',
  'metformine', 'metformin', 'metformina',
  'simvastatine', 'simvastatin', 'simvastatina',
  'oméprazole', 'omeprazole', 'omeprasole',
  'lansoprazole', 'lanzoprazole', 'lansoprasole',
  'cetirizine', 'cétirizine', 'cetrizine',
  'loratadine', 'loratadina', 'loratadinę',
  'salbutamol', 'salbutamoll', 'albuterol',
  'prednisolone', 'prednisone', 'prednysolone',
  'hydrocortisone', 'hidrocortisone', 'hydrocortisona'
];