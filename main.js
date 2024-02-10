const inputLm = document.getElementById('search-input');
const searchBtnLm = document.getElementById('search-button');
const url = 'https://pokeapi.co/api/v2/pokemon/';

// add pokeball images for versions summary
// add stats bar graph
// ability fetch and generate summary function
// add media queries
// improve loading icon
// add metric values function

function showLoading() {
  const loadingTextLm = document.getElementById('loading-text');
  loadingTextLm.classList.add('show');
}

function hideLoading() {
  const loadingTextLm = document.getElementById('loading-text');
  loadingTextLm.classList.remove('show');
}

async function getPokemonData(srchVal) {
  showLoading()
  const response = await fetch(url + srchVal);
  console.log(response, response.status)

  if (response.status !== 200) {
    alert("Pokémon not found");
    hideLoading();
    throw new Error("Couldn't fetch the data.");
  } 
  
  const pokemonData = await response.json();
  const responseSpecies = await fetch(pokemonData.species.url);

  if (responseSpecies.status !== 200) {
    hideLoading();
    throw new Error("Couldn't fetch the species data.");
  }  

  const speciesData = await responseSpecies.json();
  return {pokemonData, speciesData};
}

function validateInput(input) {
  const regex = /[^a-z\d]+|^$/;
  console.log(input)

  if (regex.test(input)) {
    alert('Input not valid');
    return 1
  }
  return 0;
}

function generateAbility(arr) {
  return arr.map((ability) => {
    if (ability['is_hidden'] === false) {
      return `<p>${ability.ability.name}</p>`;
    } 
    else if (ability['is_hidden'] === true) {
      return `<p class="hidden-ability">${ability.ability.name}???</p>`;
    }
  }).join('');
}

function formatCategory(string) {
  const regex = /\spok(?:e|é)mon/i;
  return string.replace(regex, '');
}

function formatSummary(string) {
  const regexSoftHypen = /\u00AD\n\f/g;
  const regexNewline = /\n|\f/g;
  const regexAllCapitalWord = /([A-Z]{2,})/g;
  
  const strRemoveSoftHypen = string.replace(regexSoftHypen, '');
  const formatedString = strRemoveSoftHypen.replace(regexNewline, ' ')
  
  if (regexAllCapitalWord.test(string)) {
    return formatedString.replace(regexAllCapitalWord, (match) => {
      if (string.startsWith(match)) {
        const allCapitalWord = match;
        return allCapitalWord[0] + allCapitalWord.slice(1).toLowerCase();
      } 
      else {
        return match.toLowerCase();
      }
    });
  } 
  else {
    return formatedString;
  }
}

function getFirstEnSummary(entriesArr) {
  let firstEnSummary = '';
  let matchIndex = 0;

  for (let i = 0; i < entriesArr.length; i++) {
    if (entriesArr[i].language.name === 'en') {
      firstEnSummary = entriesArr[i].flavor_text;
      matchIndex = i;
      break;
    }
  }

  return {summary: firstEnSummary, index: matchIndex};
} 

function getSecondEnSummary(entriesArr) {
  const summaryObj = getFirstEnSummary(entriesArr);
  let secondEnSummary = '';

  for (let i = summaryObj.index + 1; i < entriesArr.length; i++) {
    if (entriesArr[i].language.name === 'en' && entriesArr[i].flavor_text !== summaryObj.summary) {
      secondEnSummary = entriesArr[i].flavor_text;
      break;
    }
  }

  if(!secondEnSummary) {
    return 'No additional entry has been found.';
  }

  return secondEnSummary;
}

function changeSummary(summaryLm, entriesArr, callback, classToRemove, classToAdd) {
  summaryLm.classList.remove(classToRemove);
  summaryLm.classList.add(classToAdd);

  summaryLm.innerText = callback(entriesArr).constructor === Object 
    ? formatSummary(callback(entriesArr).summary)
    : formatSummary(callback(entriesArr));
}

function generatePokeSummaryEvent(entriesArr) {
  const pokemonSummaryLm = document.getElementById('pokemon-summary');

  document.getElementById('summary-versions').addEventListener('click', (e) => {
    if (e.target.matches('.summary-option-1-btn') && pokemonSummaryLm.classList.contains('summary-2')) {
      changeSummary(pokemonSummaryLm, entriesArr, getFirstEnSummary, 'summary-2', 'summary-1');
    } 
    else if (e.target.matches('.summary-option-2-btn') && pokemonSummaryLm.classList.contains('summary-1')) {
      changeSummary(pokemonSummaryLm, entriesArr, getSecondEnSummary, 'summary-1', 'summary-2');
    }
  });
}

function getPokeAvbleGendrs(data) {
  const genderTypesLm = document.getElementById('gender-types');
  const regexMale = /\bmale\b/;
  const regexFemale = /\bfemale\b/;

  if (data.pokemonData.forms.find((form) => regexMale.test(form.name))) {
    genderTypesLm.innerHTML = 'M';
    return;
  } 
  else if (data.pokemonData.forms.find((form) => regexFemale.test(form.name))) {
    genderTypesLm.innerHTML = 'F';
    return;
  }

  if (data.speciesData.gender_rate === 8) {
    genderTypesLm.innerHTML = 'F';
  } 
  else if (data.speciesData.gender_rate === 0) {
    genderTypesLm.innerHTML = 'M';
  } 
  else if (data.speciesData.gender_rate === -1) {
    genderTypesLm.innerHTML = 'Unknown';
  } 
  else {
    genderTypesLm.innerHTML = 'M F';
  }
}

function generateType(typeArr) {
  return typeArr.map((type) => `
  <div class="${type}-type">
    <img src="images/types/${type}-icon.png">
    <p>${type.toUpperCase()}</p>
  </div>
  `).join('');
}


function generateHTML(data) {
  const pokeContainerLm = document.getElementById('pokemon-container');

  pokeContainerLm.innerHTML = `
  <div class="sprite-name">
    <img class="pokemon-sprite" id="sprite" src="${data.pokemonData.sprites.front_default}" alt="">
    <h2 id="pokemon-name">${data.pokemonData.name.toUpperCase()}&nbsp</h2>
    <h2 id="pokemon-id">#${data.pokemonData.id}</h2>
  </div>
  <div class="pokemon-info">
    <div class="image-stats">
      <img src="${data.pokemonData.sprites.other['official-artwork'].front_default}" alt="">
      <div class="pokemon-stats">
        <div>
          <h3>HP:</h3>
          <p id="hp">${data.pokemonData.stats[0].base_stat}</p>
        </div>
        <div>
          <h3>Attack:</h3>
          <p id="attack">${data.pokemonData.stats[1].base_stat}</p>
        </div>
        <div>
          <h3>Deffense:</h3>
          <p id="defense">${data.pokemonData.stats[2].base_stat}</p>
        </div>
        <div>
          <h3>Sp. Attack:</h3>
          <p id="special-attack">${data.pokemonData.stats[3].base_stat}</p>
        </div>
        <div>
          <h3>Sp. Defense</h3>
          <p id="special-defense">${data.pokemonData.stats[4].base_stat}</p>
        </div>
        <div>
          <h3>Speed:</h3>
          <p id="speed">${data.pokemonData.stats[5].base_stat}</p>
        </div>
      </div>
    </div>
    <div class="more-info">
      <p class="summary-1" id="pokemon-summary">${formatSummary(getFirstEnSummary(data.speciesData.flavor_text_entries).summary)}</p>
      <div id="summary-versions" class="summary-versions">
        <button class="summary-option-1-btn">1</button> 
        <button class="summary-option-2-btn">2</button>
      </div>
      <div class="pokemon-details">
        <div>
          <h3>Height</h3>
          <p id="height">${data.pokemonData.height}</p>
          <h3>Weight</h3>
          <p id="weight">${data.pokemonData.weight}</p>
          <h3>Gender</h3>
          <p id="gender-types">M F</p>
        </div>
        <div>
          <h3>Category</h3>
          <p>${formatCategory(data.speciesData.genera.find((genus) => genus.language.name === 'en').genus)}</p>
          <h3>Ablility</h3>
          <p>${generateAbility(data.pokemonData.abilities)}</p>
        </div>
      </div>
      <h3>Type</h3>
      <div class="types-container" id="types">
        ${generateType(data.pokemonData.types.map((obj) => obj.type.name))}
      </div>
    </div>
  </div>
  `;
}

function displayPokemon() {
  const searchVal = inputLm.value.trim().toLowerCase();
  console.log(searchVal);

  if (validateInput(searchVal)) {
    return;
  }
  
  getPokemonData(searchVal)
    .then((data) => {
      hideLoading();
      console.log(data);
      const entriesArr = data.speciesData.flavor_text_entries;
      console.log(entriesArr);
      console.log(data.speciesData.gender_rate);
      console.log(data.pokemonData.types.map((obj) => obj.type.name))

      generateHTML(data);
      getPokeAvbleGendrs(data);
      generatePokeSummaryEvent(entriesArr);
    })
    .catch((err) => {
      hideLoading();
      console.error(err)
    });
}


searchBtnLm.addEventListener('click', displayPokemon);