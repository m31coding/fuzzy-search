function createSearcher(latinOnly) {
  console.log(`creating a searcher with latinOnly=${latinOnly}`);
  const defaultConfig = self.fuzzySearch.Config.createDefaultConfig();
  if (!latinOnly) {
    defaultConfig.normalizerConfig.allowCharacter = (c) => true;
  }
  return self.fuzzySearch.SearcherFactory.createSearcher(defaultConfig);
}

function indexData(searcher, entities, searchDataConfig) {
  console.log(`indexing ${entities.length} entities of kind ${searchDataConfig.dataKind}`);
  const meta = searcher.indexEntities(entities, searchDataConfig.getId, searchDataConfig.getTerms);
  console.log('finished indexing');
  return meta;
}

class SearchDataConfig {
  constructor(dataKind, getId, getTerms, getEntityString) {
    this.dataKind = dataKind;
    this.getId = getId;
    this.getTerms = getTerms;
    this.getEntityString = getEntityString;
  }
}

const osmPlacesConfig = new SearchDataConfig(
  'osm-places',
  (place) => place.id,
  (place) => place.name.split(';'),
  (place) => place.name
);

const personsConfig = new SearchDataConfig(
  'persons',
  (person) => person.id,
  (person) => [person.firstName, person.lastName, `${person.firstName} ${person.lastName}`],
  (person) =>
    person.locale ?
      `${person.firstName} ${person.lastName} (${person.locale})`
    : `${person.firstName} ${person.lastName}`
);

function getSearchDataConfig(dataKind) {
  switch (dataKind) {
    case 'osm-places':
      return osmPlacesConfig;
    case 'persons':
      return personsConfig;
    default:
      throw new Error(`unknown data kind: ${dataKind}`);
  }
}

self.createSearcher = createSearcher;
self.indexData = indexData;
self.getSearchDataConfig = getSearchDataConfig;
