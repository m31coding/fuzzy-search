import * as fuzzySearch from '../dist/fuzzy-search.module.js';
import './fuzzy-demo-commons.js';
self.fuzzySearch = fuzzySearch;

let allFakers = null;
let allLocales = null;
let localeKeys = null;
let scriptToLocales = null;

const indexStatusText = document.getElementById('index-status-text');
const indexingMetaDiv = document.getElementById('indexing-meta');
const matchesTable = document.getElementById('matches-table');
const tableBody = matchesTable.getElementsByTagName('tbody')[0];
const hint = document.getElementById('hint');
const searchBar = document.getElementById('search-bar');
const queryDurationSpan = document.getElementById('query-duration');
const performanceTestResult = document.getElementById('performance-test-result');
const editModal = document.getElementById('edit-modal');
const personNumberOfNamesInput = document.querySelector('#person-parameters input[name="number-of-names"]');
const personRandomSeedInput = document.querySelector('#person-parameters input[name="random-seed"]');
const reindexStatusText = document.getElementById('reindex-status-text');
const dataPreview = document.getElementById('data-preview');
const performanceTestRandomSeedInput = document.querySelector('#performance-test input[name="random-seed"]');
const performanceTestNumberOfQueriesInput = document.querySelector('#performance-test input[name="number-of-queries"]');
const performanceTestMaxMatchesInput = document.querySelector('#performance-test input[name="max-matches"]');
const performanceTestMinQualityInput = document.querySelector('#performance-test input[name="min-quality"]');
document.getElementById('osm-data-card').addEventListener('click', downloadAndIndexOsmData);
document
  .getElementById('person-data-card')
  .addEventListener('click', async (e) => await generateAndIndexPersonData(false));
dataPreview.addEventListener('scroll', (e) => {
  onDataPreviewScrolled(e);
});
document.getElementById('cancel-button').addEventListener('click', cancelIndexing);
document.getElementById('reindex-button').addEventListener('click', reindex);
document.getElementById('reindex-cancel-button').addEventListener('click', cancelIndexing);
document.getElementById('download-data-button').addEventListener('click', downloadData);
searchBar.addEventListener('input', search);
document.getElementById('update-entity').addEventListener('click', updateEntity);
document.getElementById('remove-entity').addEventListener('click', removeEntity);
document.getElementById('close-edit-modal').addEventListener('click', () => hide('edit-modal'));
document.getElementById('open-add-modal').addEventListener('click', openAddModal);
document.getElementById('add-entity').addEventListener('click', addEntity);
document.getElementById('close-add-modal').addEventListener('click', () => hide('add-modal'));
document.getElementById('performance-test-button').addEventListener('click', runPerformanceTest);

let currentIndexingRequest = null;
let currentInstance = null;

initializeParameterInput(personNumberOfNamesInput, parsePositiveIntInput);
initializeParameterInput(personRandomSeedInput, parseIntInput);
initializeParameterInput(performanceTestRandomSeedInput, parseIntInput);
initializeParameterInput(performanceTestNumberOfQueriesInput, parsePositiveIntInput);
initializeParameterInput(performanceTestMaxMatchesInput, parsePositiveIntInput);
initializeParameterInput(performanceTestMinQualityInput, parsePositiveFloatInput);

wireTableRows();

class IndexingRequest {
  constructor(reindex) {
    this.reindex = reindex;
    this.canceled = false;
    this.worker = null;
    this.data = null;
    this.searchDataConfig = null;
  }

  cancel() {
    this.canceled = true;

    if (this.worker != null) {
      this.worker.terminate();
    }
  }
}

class Instance {
  constructor(searcher, data, searchDataConfig) {
    this.searcher = searcher;
    this.data = data;
    this.searchDataConfig = searchDataConfig;
    this.dataPreviewOffset = 0;
    this.dataPreviewSliceSize = 100;
  }

  get entityPreviewSlice() {
    if (this.dataPreviewOffset + 2 * this.dataPreviewSliceSize <= this.data.entities.length) {
      return this.data.entities.slice(this.dataPreviewOffset, this.dataPreviewOffset + this.dataPreviewSliceSize);
    } else {
      return this.data.entities.slice(this.dataPreviewOffset);
    }
  }

  incrementDataPreviewOffset() {
    if (this.dataPreviewOffset + 2 * this.dataPreviewSliceSize <= this.data.entities.length) {
      this.dataPreviewOffset += this.dataPreviewSliceSize;
    }
    console.dir(this.dataPreviewOffset);
  }

  decrementDataPreviewOffset() {
    this.dataPreviewOffset -= this.dataPreviewSliceSize;
    this.dataPreviewOffset = Math.max(this.dataPreviewOffset, 0);
    console.dir(this.dataPreviewOffset);
  }
}

function newIndexingRequest(reindex = false) {
  cancelIndexing();
  resetUi(reindex);
  show('index-status');
  const indexingRequest = new IndexingRequest(reindex);
  currentInstance = null;
  currentIndexingRequest = indexingRequest;
  return indexingRequest;
}

function show(elementId) {
  document.getElementById(elementId).classList.remove('invisible');
}

function isShown(elementId) {
  return !document.getElementById(elementId).classList.contains('invisible');
}

function hide(elementId) {
  document.getElementById(elementId).classList.add('invisible');
}

function resetUi(reindex) {
  indexStatusText.innerHTML = '';
  reindexStatusText.innerHTML = '';
  dataPreview.value = '';
  searchBar.value = '';
  renderMatches([], null);
  renderMeta(new Map());
  queryDurationSpan.textContent = '0 ms';
  performanceTestResult.textContent = '';
  if (!reindex) {
    document.getElementById('data-details').removeAttribute('open');
  }
  document.getElementById('indexing-meta-details').removeAttribute('open');
  document.getElementById('performance-test-details').removeAttribute('open');
  hideAll(reindex);
}

function hideAll(reindex) {
  if (!reindex) {
    hide('data-details');
  }
  hide('indexing-meta-details');
  hide('hint');
  hide('search-bar-div');
  hide('matches-container');
  hide('edit-modal');
  hide('add-modal');
  hide('add-container');
  hide('performance-test-details');
}

function showAll(dataKind) {
  show('data-details');
  if (dataKind === `osm-places`) {
    document.getElementById('name-container').classList.add('display-none');
  } else {
    document.getElementById('name-container').classList.remove('display-none');
  }
  show('indexing-meta-details');
  show('hint');
  show('search-bar-div');
  show('matches-container');
  show('add-container');
  show('performance-test-details');
}

async function downloadAndIndexOsmData() {
  const indexingRequest = newIndexingRequest();
  console.log('downloading osm data');
  getIndexStatusTextElement().innerHTML += 'Downloading... <wbr/>';
  const response = await fetch('../data/world-ctvs.txt');

  if (!response.ok) {
    getIndexStatusTextElement().innerHTML += `${response.status}.`;
    return;
  }

  if (indexingRequest.canceled) {
    return;
  }

  const text = await response.text();

  if (indexingRequest.canceled) {
    return;
  }

  const lines = text.split('\n').slice(1);

  if (indexingRequest.canceled) {
    return;
  }

  const entities = lines.map((l, index) => ({ id: index, name: l }));

  if (indexingRequest.canceled) {
    return;
  }

  const data = {
    entities: entities,
    kind: 'osm-places',
    latinOnly: false
  };

  indexingRequest.data = data;
  indexingRequest.searchDataConfig = self.getSearchDataConfig(data.kind);
  index(indexingRequest);
}

async function generateAndIndexPersonData(reindex = false) {
  if (!reindex) {
    resetInput(personNumberOfNamesInput);
    resetInput(personRandomSeedInput);
  }

  const numberOfNames = personNumberOfNamesInput.dataValue;
  const randomSeed = personRandomSeedInput.dataValue;

  if (nullOrUndefined(numberOfNames) || nullOrUndefined(randomSeed)) {
    return;
  }

  const indexingRequest = newIndexingRequest(reindex);

  if (allFakers === null || allLocales === null) {
    getIndexStatusTextElement().innerHTML += 'Downloading... <wbr/>';
    const faker = await importFaker();

    if (faker === null) {
      return;
    }

    allFakers = faker.allFakers;
    allLocales = faker.allLocales;
    localeKeys = Object.keys(allFakers).filter((loc) => loc !== 'base');
    scriptToLocales = groupBy(localeKeys, (locale) => allLocales[locale].metadata.script);
    initializeLocaleSelection();
  }

  getIndexStatusTextElement().innerHTML += 'Generating data... <wbr/>';
  setTimeout(() => generateAndIndexPersonDataPart2(indexingRequest, numberOfNames, randomSeed), 0);
}

async function importFaker() {
  try {
    return await import('../node_modules/@faker-js/faker/dist/esm/index.mjs');
  } catch (e) {
    console.log(e);
    getIndexStatusTextElement().innerHTML += `Import error.`;
    return null;
  }
}

function generateAndIndexPersonDataPart2(indexingRequest, numberOfNames, randomSeed) {
  const personData = generatePersonData(numberOfNames, randomSeed);
  const entities = personData.entities.map((e, index) => ({
    id: index,
    firstName: e.firstName,
    lastName: e.lastName,
    locale: e.locale
  }));

  const latinOnly = personData.scripts.size === 1 && personData.scripts.has('Latn');

  const data = {
    entities: entities,
    kind: 'persons',
    latinOnly: latinOnly
  };

  indexingRequest.data = data;
  indexingRequest.searchDataConfig = self.getSearchDataConfig(data.kind);
  index(indexingRequest);
}

function reindex() {
  generateAndIndexPersonData(true);
}

function generatePersonData(numberOfNames, randomSeed) {
  const data = {};
  const activeLocales = getActiveLocales();
  data.entities = generatePersonDataWithFaker(numberOfNames, randomSeed, activeLocales);
  data.scripts = getScripts(activeLocales);
  return data;
}

function getActiveLocales() {
  let activeLocales = [];

  for (let locale of localeKeys) {
    let checkbox = document.getElementById(`checkbox-${locale}`);
    if (checkbox.checked) {
      activeLocales.push(locale);
    }
  }

  return activeLocales;
}

function getScripts(locales) {
  return new Set(locales.map((locale) => allLocales[locale].metadata.script));
}

function generatePersonDataWithFaker(numberOfNames, randomSeed, locales) {
  console.log(`generating ${numberOfNames} names with seed ${randomSeed} and locales ${locales}`);
  const fakers = locales.map((locale) => allFakers[locale]);

  for (let faker of fakers) {
    faker.seed(randomSeed);
    randomSeed = randomSeed + 1;
  }

  const persons = [];
  const counterMax = fakers.length;
  let counter = 0;

  for (let i = 0; i < numberOfNames; i++) {
    persons.push(createPerson(fakers[counter++]));
    if (counter === counterMax) {
      counter = 0;
    }
  }

  return persons;
}

function createPerson(faker) {
  const person = {};
  person.firstName = faker.person.firstName();
  person.lastName = faker.person.lastName();
  person.locale = faker.metadata.code;
  return person;
}

function onDataPreviewScrolled(event) {
  if (currentInstance === null) {
    return;
  }

  const element = event.target;

  if (element.scrollTop + element.clientHeight >= element.scrollHeight - 1) {
    const currentOffset = currentInstance.dataPreviewOffset;
    currentInstance.incrementDataPreviewOffset();

    if (currentOffset !== currentInstance.dataPreviewOffset) {
      renderDataPreview();
      element.scrollTop = 2;
    }
  } else if (element.scrollTop === 0 || element.scrollTop === 1) {
    const currentOffset = currentInstance.dataPreviewOffset;
    currentInstance.decrementDataPreviewOffset();

    if (currentOffset !== currentInstance.dataPreviewOffset) {
      renderDataPreview();
      element.scrollTop = element.scrollHeight - element.clientHeight - 2;
    }
  }
}

function index(indexingRequest) {
  console.log('indexing');
  getIndexStatusTextElement().innerHTML += ' Indexing... <wbr/>';
  const data = indexingRequest.data;

  if (data == null) {
    currentInstance = null;
    return;
  }

  if (nullOrUndefined(data.latinOnly)) {
    throw new Error('latinOnly is not defined');
  }

  indexingRequest.worker = new Worker('./indexing-worker.js');

  indexingRequest.worker.onmessage = (e) => {
    if (indexingRequest.canceled) {
      return;
    }

    const memento = new fuzzySearch.Memento(e.data.mementoObjects);
    const searcher = self.createSearcher(data.latinOnly);
    searcher.load(memento);

    if (indexingRequest.canceled) {
      return;
    }

    currentInstance = new Instance(searcher, data, indexingRequest.searchDataConfig);
    getIndexStatusTextElement().innerHTML += 'Done.';
    currentIndexingRequest = null;
    renderDataPreview();
    renderMeta(e.data.indexingMeta);
    renderHint(indexingRequest.data.kind, data.entities[0]);
    showAll(indexingRequest.data.kind);
    console.log('ready to search');
  };

  indexingRequest.worker.postMessage(data);
}

function cancelIndexing() {
  console.log('canceling indexing');

  if (currentIndexingRequest != null) {
    currentIndexingRequest.cancel();
    getIndexStatusTextElement().innerHTML += 'Canceled.';
    currentIndexingRequest = null;
  }
}

function renderDataPreview() {
  dataPreview.value = createCsv(
    currentInstance.entityPreviewSlice,
    currentInstance.data.kind,
    currentInstance.dataPreviewOffset === 0
  );
}

function createCsv(entities, dataKind, includeHeader) {
  if (dataKind === 'osm-places') {
    return createCsvForPlaces(entities, includeHeader);
  } else {
    return createCsvForPersons(entities, includeHeader);
  }
}

function createCsvForPlaces(places, includeHeader) {
  const result = includeHeader ? ['ID; NAME1; NAME2; ...', ''] : [];
  for (let i = 0; i < places.length; i++) {
    result.push(`${places[i].id}; ${places[i].name}`);
  }
  return result.join('\n');
}

function createCsvForPersons(persons, includeHeader) {
  const result = includeHeader ? ['ID; FIRST NAME; LAST NAME; LOCALE', ''] : [];
  for (let person of persons) {
    result.push(`${person.id}; ${person.firstName}; ${person.lastName}; ${person.locale}`);
  }
  return result.join('\n');
}

function downloadData() {
  if (currentInstance === null) {
    return;
  }

  const csv = createCsv(currentInstance.data.entities, true);
  saveAs(createBlob(csv), `${currentInstance.data.kind}.csv`);
}

function createBlob(csv) {
  return new Blob([csv], { type: 'text/csv;charset=utf-8' });
}

function renderMeta(indexingMeta) {
  let metaHtml = ``;
  for (const [key, value] of indexingMeta) {
    metaHtml += `${key}: ${value}<br>`;
  }
  indexingMetaDiv.innerHTML = metaHtml;
}

function renderHint(dataKind, firstEntity) {
  if (dataKind === 'osm-places') {
    hint.innerHTML = `Search for a place, e.g. <i>Boulder Creek, Tübingen, თბილისი, مدينة
        الكويت, 東京都, ...</i>`;
  } else {
    if (firstEntity) {
      hint.innerHTML = `Search for a first name, last name or full name, e.g. <i>${firstEntity.firstName}, ${firstEntity.lastName}, ${firstEntity.firstName} ${firstEntity.lastName}.</i>`;
    } else {
      hint.innerHTML = `Search for a first name, last name or full name.`;
    }
  }
}

async function search() {
  if (currentInstance === null) {
    renderMatches([], null);
    return;
  }

  const query = new fuzzySearch.Query(searchBar.value);
  const result = currentInstance.searcher.getMatches(query);
  renderQueryMeta(result.meta);
  renderMatches(result.matches, currentInstance.searchDataConfig);
}

function renderQueryMeta(meta) {
  queryDurationSpan.textContent = `${meta.get('queryDuration')} ms`;
}

function renderMatches(matches, searchDataConfig) {
  fillTableWithMatches(matches, searchDataConfig);
  hideRowsWithoutMatches(matches);
}

function fillTableWithMatches(matches, searchDataConfig) {
  for (let i = 0; i < Math.min(matches.length, 10); i++) {
    let row = tableBody.children[i];
    row.match = matches[i];
    row.children[1].textContent = searchDataConfig.getEntityString(matches[i].entity);
    row.children[2].textContent = matches[i].matchedString;
    row.children[3].textContent = matches[i].quality.toFixed(2);
    row.children[0].classList.remove('invisible');
    row.children[1].classList.remove('invisible');
    row.children[2].classList.remove('invisible');
    row.children[3].classList.remove('invisible');
  }
}

function hideRowsWithoutMatches(matches) {
  for (let i = matches.length; i < 10; i++) {
    let row = tableBody.children[i];
    row.matches = null;
    row.children[0].classList.add('invisible');
    row.children[1].classList.add('invisible');
    row.children[2].classList.add('invisible');
    row.children[3].classList.add('invisible');
    row.children[1].textContent = '';
    row.children[2].textContent = '';
    row.children[3].textContent = '';
  }
}

function initializeLocaleSelection() {
  for (let script of Object.keys(scriptToLocales).sort()) {
    const severalScripts = scriptToLocales[script].length > 1;
    let html = ``;

    if (severalScripts) {
      html += `<div class="script-div">
            <label>${script}</label>  
            <input type="checkbox" id="checkbox-script-${script}" name="checkbox-script-${script}" value="${script}" checked>
            <label for="checkbox-script-${script}">All / None</label>  
            </div>
            `;
    } else {
      html += `<div class="script-div">
            <label>${script}</label>  
            </div>`;
    }

    let htmlLocales = '';

    for (let locale of scriptToLocales[script].sort()) {
      let title = allLocales[locale].metadata.title;
      htmlLocales += `
            <span class="locale-checkbox">
                <input type="checkbox" id="checkbox-${locale}" name="checkbox-${locale}" value="${locale}" checked>
                <label for="checkbox-${locale}">${locale}: ${title}</label>
            </span>`;
    }

    if (htmlLocales !== '') {
      html += `<div class="locale-checkboxes">${htmlLocales}</div>`;
    }

    const localeSelection = document.getElementById('locale-selection');
    localeSelection.innerHTML += `<div class="locales-for-script">${html}</div>`;
  }

  for (let script in scriptToLocales) {
    const severalScripts = scriptToLocales[script].length > 1;

    if (!severalScripts) {
      continue;
    }

    const element = document.getElementById(`checkbox-script-${script}`);
    element.addEventListener('change', function (event) {
      if (event.target.checked) {
        checkLocalesOfScript(script);
      } else {
        uncheckLocalesOfScript(script);
      }
    });
  }

  for (let locale of localeKeys) {
    let metadata = allLocales[locale].metadata;
    let faker = allFakers[locale];
    faker.metadata = metadata;
  }
}

function groupBy(items, callback) {
  return items.reduce(function (result, x) {
    (result[callback(x)] = result[callback(x)] || []).push(x);
    return result;
  }, {});
}

function checkLocalesOfScript(script) {
  setLocalesOfScript(script, true);
}

function uncheckLocalesOfScript(script) {
  setLocalesOfScript(script, false);
}

function setLocalesOfScript(script, checked) {
  for (let locale of scriptToLocales[script]) {
    document.getElementById(`checkbox-${locale}`).checked = checked;
  }
}

function wireTableRows() {
  const rows = matchesTable.getElementsByTagName('tr');
  for (let i = 0; i < rows.length; i++) {
    const currentRow = matchesTable.rows[i];
    currentRow.onclick = onMatchClicked;
  }
}

function onMatchClicked(event) {
  if (modalIsOpen()) {
    return;
  }

  const parent = event.target.parentElement;

  if (parent && parent.match) {
    const match = parent.match;
    editModal.match = match;
    const entityProperties = document.querySelector('#edit-modal .entity-properties');
    entityProperties.innerHTML = '';
    entityProperties.innerHTML += `
        <label>
            Id (readonly)
            <input type="number" name="id" value="${match.entity.id}" readonly/>
        </label>`;

    if (currentInstance.data.kind === 'osm-places') {
      entityProperties.innerHTML += `
            <label>
                Name
                <input type="text" name="name" value="${match.entity.name}"/>
            </label>`;
      document
        .querySelector('#edit-modal input[name="name"]')
        .addEventListener('input', (e) => (editModal.match.entity.name = e.target.value));
    } else {
      entityProperties.innerHTML += `
            <label>
                First Name
                <input type="text" name="first-name" value="${match.entity.firstName}"/>
            </label>`;
      entityProperties.innerHTML += `
            <label>
                Last Name
                <input type="text" name="last-name" value="${match.entity.lastName}"/>
            </label>`;
      document
        .querySelector('#edit-modal input[name="first-name"]')
        .addEventListener('input', (e) => (editModal.match.entity.firstName = e.target.value));
      document
        .querySelector('#edit-modal input[name="last-name"]')
        .addEventListener('input', (e) => (editModal.match.entity.lastName = e.target.value));
    }

    show('edit-modal');
  }
}

function openAddModal() {
  if (modalIsOpen()) {
    return;
  }

  const entityProperties = document.querySelector('#add-modal .entity-properties');
  entityProperties.innerHTML = '';
  entityProperties.innerHTML += `
    <label>
        <span>Id (number) <span class="parameter-error"></span></span>
        <input type="number" name="id"/>
    </label>`;

  if (currentInstance.data.kind === 'osm-places') {
    entityProperties.innerHTML += `
        <label>
            <span>Name <span class="parameter-error"></span></span>
            <input type="text" name="name"/>
        </label>`;
    initializeParameterInput(getAddModalNameInput(), parseStringInput);
  } else {
    entityProperties.innerHTML += `
        <label>
            <span>First Name <span class="parameter-error"></span></span>
            <input type="text" name="first-name"/>
        </label>`;
    entityProperties.innerHTML += `
        <label>
            <span>Last Name <span class="parameter-error"></span></span>
            <input type="text" name="last-name"/>
        </label>`;
    initializeParameterInput(getAddModalFirstNameInput(), parseStringInput);
    initializeParameterInput(getAddModalLastNameInput(), parseStringInput);
  }

  initializeParameterInput(getAddModalIdInput(), parseNewIdInput);
  show('add-modal');
}

function getAddModalIdInput() {
  return document.querySelector('#add-modal input[name="id"]');
}

function getAddModalNameInput() {
  return document.querySelector('#add-modal input[name="name"]');
}

function getAddModalFirstNameInput() {
  return document.querySelector('#add-modal input[name="first-name"]');
}

function getAddModalLastNameInput() {
  return document.querySelector('#add-modal input[name="last-name"]');
}

function modalIsOpen() {
  return isShown('edit-modal') || isShown('add-modal');
}

async function addEntity() {
  if (currentInstance === null) {
    return null;
  }

  const searchDataConfig = currentInstance.searchDataConfig;
  const entity = getEntityToAdd(searchDataConfig.dataKind);
  if (entity === null) {
    return;
  }

  console.log(`adding entity`);
  console.dir(entity);
  const _meta = currentInstance.searcher.upsertEntities([entity], searchDataConfig.getId, searchDataConfig.getTerms);
  hide('add-modal');
  await search();
}

function getEntityToAdd(dataKind) {
  const id = getAddModalIdInput().dataValue;

  if (nullOrUndefined(id)) {
    return null;
  }

  if (dataKind === 'osm-places') {
    const name = getAddModalNameInput().dataValue;

    if (nullOrUndefined(name)) {
      return null;
    }

    return { id: id, name: name };
  } else {
    const firstName = getAddModalFirstNameInput().dataValue;
    const lastName = getAddModalLastNameInput().dataValue;

    if (nullOrUndefined(firstName) || nullOrUndefined(lastName)) {
      return null;
    }

    return { id: id, firstName: firstName, lastName: lastName };
  }
}

async function updateEntity() {
  if (currentInstance === null) {
    return;
  }

  const searchDataConfig = currentInstance.searchDataConfig;
  const entity = editModal.match.entity;
  console.dir(`updating entity`);
  console.dir(entity);
  const _meta = currentInstance.searcher.upsertEntities([entity], searchDataConfig.getId, searchDataConfig.getTerms);
  hide('edit-modal');
  await search();
}

async function removeEntity() {
  if (currentInstance === null) {
    return;
  }

  const id = editModal.match.entity.id;
  console.dir(`removing entity with id ${id}.`);
  currentInstance.searcher.removeEntities([id]);
  hide('edit-modal');
  await search();
}

function runPerformanceTest() {
  if (currentInstance === null) {
    renderPerformanceTestResult();
    return;
  }

  const randomSeed = performanceTestRandomSeedInput.dataValue;
  const numberOfQueries = performanceTestNumberOfQueriesInput.dataValue;
  const maxMatches = performanceTestMaxMatchesInput.dataValue;
  const minQuality = performanceTestMinQualityInput.dataValue;

  if (
    nullOrUndefined(randomSeed) ||
    nullOrUndefined(numberOfQueries) ||
    nullOrUndefined(maxMatches) ||
    nullOrUndefined(minQuality)
  ) {
    renderPerformanceTestResult();
    return;
  }

  const testRunParameters = new fuzzySearch.TestRunParameters(randomSeed, numberOfQueries, maxMatches, minQuality);
  const performanceTest = new fuzzySearch.PerformanceTest(currentInstance.searcher);
  const report = performanceTest.run(testRunParameters);
  renderPerformanceTestResult(report);
}

function initializeParameterInput(input, parse) {
  const error = input.parentElement.children[0].children[0];
  input.addEventListener('input', (e) => valueChanged(e.target.value));
  valueChanged(input.value);

  function valueChanged(newValue) {
    const parsed = parse(newValue);
    if (parsed.error) {
      error.textContent = parsed.error;
      input.dataValue = null;
    } else {
      error.textContent = '';
      input.dataValue = parsed.value;
    }
  }
}

function renderPerformanceTestResult(result) {
  if (nullOrUndefined(result)) {
    performanceTestResult.textContent = '';
    return;
  }

  const lines = [];
  lines.push(`total duration: ${Math.round(result.totalDuration)} ms`);
  lines.push(`average duration: ${Math.round(result.averageDuration)} ms`);
  lines.push(`standard deviation: ${Math.round(result.standardDeviation)} ms`);
  lines.push(`fastest: "${withLeftToRightEmbedding(result.fastest.query)}", ${Math.round(result.fastest.duration)} ms`);
  lines.push(`slowest: "${withLeftToRightEmbedding(result.slowest.query)}", ${Math.round(result.slowest.duration)} ms`);
  lines.push(`longest: "${withLeftToRightEmbedding(result.longest.query)}", ${Math.round(result.longest.duration)} ms`);
  performanceTestResult.textContent = lines.join('\n');
}

function withLeftToRightEmbedding(query) {
  return `\u202A${query}\u202C`;
}

function getIndexStatusTextElement() {
  if (currentIndexingRequest != null && currentIndexingRequest.reindex) {
    return reindexStatusText;
  } else {
    return indexStatusText;
  }
}

function parseIntInput(stringValue) {
  const result = {};
  const parsed = parseInt(stringValue);

  if (isNaN(parsed)) {
    result.error = 'Not a number';
    return result;
  } else {
    result.value = parsed;
    return result;
  }
}

function parsePositiveIntInput(stringValue) {
  const result = {};
  const parsed = parseInt(stringValue);

  if (isNaN(parsed)) {
    result.error = 'Not a number';
    return result;
  }

  if (parsed < 0) {
    result.error = 'Not positive';
    return result;
  }

  result.value = parsed;
  return result;
}

function parsePositiveFloatInput(stringValue) {
  const result = {};
  const parsed = parseFloat(stringValue);

  if (isNaN(parsed)) {
    result.error = 'Not a number';
    return result;
  }

  if (parsed < 0) {
    result.error = 'Not positive';
    return result;
  }

  result.value = parsed;
  return result;
}

function parseNewIdInput(stringValue) {
  const result = {};
  const parsed = parseInt(stringValue);

  if (isNaN(parsed)) {
    result.error = 'Not a number';
    return result;
  }

  if (currentInstance === null) {
    result.error = 'No data indexed';
    return result;
  }

  const present = currentInstance.searcher.tryGetEntity(parsed);

  if (present !== null) {
    result.error = 'Already exists';
    return result;
  }

  result.value = parsed;
  return result;
}

function parseStringInput(stringValue) {
  const result = {};
  result.value = stringValue;
  return result;
}

function resetInput(input) {
  input.value = input.defaultValue;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function nullOrUndefined(value) {
  return value === null || value === undefined;
}

function simulateTyping(strings) {
  if (strings.length === 0) {
    return;
  }

  setSearchBarValue('');
  searchBar.focus();
  setTimeout(() => simulateTypingRecursive(strings[0], strings.slice(1)), 6000);
}

function simulateTypingRecursive(string, nextStrings) {
  const arabic = /[\u0600-\u06FF]/.test(string);

  if (arabic) {
    searchBar.dir = 'rtl';
  } else {
    searchBar.dir = 'ltr';
  }

  if (searchBar.value.length >= string.length) {
    setTimeout(() => deleteSearchBarValueRecursive(nextStrings), 3000);
    return;
  }

  setSearchBarValue(searchBar.value + string[searchBar.value.length]);
  setTimeout(() => simulateTypingRecursive(string, nextStrings), 150);
}

function deleteSearchBarValueRecursive(nextStrings) {
  if (searchBar.value.length === 0 || (nextStrings[0] ?? '').startsWith(searchBar.value)) {
    if (nextStrings.length > 0) {
      setTimeout(() => simulateTypingRecursive(nextStrings[0], nextStrings.slice(1)), 500);
    }
  } else {
    setSearchBarValue(searchBar.value.slice(0, -1));
    setTimeout(() => deleteSearchBarValueRecursive(nextStrings), 100);
  }
}

function setSearchBarValue(value) {
  searchBar.value = value;
  searchBar.dispatchEvent(new Event('input', { bubbles: true }));
}

// call self.simulateTyping() in the console.
self.simulateTyping = () =>
  simulateTyping(['boulder creek', 'bouldre crek', 'tübingen', 'თბილისი', 'مدينة الكويت', '東都', '東京都']);
