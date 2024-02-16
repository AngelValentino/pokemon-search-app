const inputLm = document.getElementById('search-input');
const searchBtnLm = document.getElementById('search-button');
const url = 'https://pokeapi.co/api/v2/pokemon/';
let pokemonLdgTmtId;
let abltyLdgTmtId;

function showLoading() {
  pokemonLdgTmtId = setTimeout(() => {
    const loadingLm = document.getElementById('loading-container');
    loadingLm.style.display = 'flex';
  }, 100);
}

function hideLoading() {
  clearTimeout(pokemonLdgTmtId);
  const loadingLm = document.getElementById('loading-container');
  loadingLm.style.display = 'none';
}

function showAbilityInfoLoading() {
  abltyLdgTmtId = setTimeout(() => {
    const loadingLm = document.getElementById('details-loading-container');
    loadingLm.style.display = 'flex';
  }, 100);
}

function hideAbilityInfoLoading() {
  clearTimeout(abltyLdgTmtId);
  const loadingLm = document.getElementById('details-loading-container');
  loadingLm.style.display = 'none';
}

function hidePageTitle() {
  const titleLm = document.getElementById('page-title');
  if (getComputedStyle(titleLm).display === 'block') {
    titleLm.style.display = 'none';
  }
}

async function getPokemonData(srchVal) {
  showLoading();
  const response = await fetch(url + srchVal);

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

async function getPokemonAbilityData(abilityName) {
  showAbilityInfoLoading();
  const abilityUrl = 'https://pokeapi.co/api/v2/ability/';

  const response = await fetch(abilityUrl + abilityName);
  
  if (response.status !== 200) {
    alert("Ability info not found");
    hideAbilityInfoLoading();
    throw new Error("Couldn't fetch the data.");
  } 

  const abilityData = await response.json();
  return abilityData;
}

function validateInput(input) {
  const regex = /^[a-z\d]+(?:-[a-z]+)?$/;

  if (input === '') {
    alert('Please insert a value.');
    return 1;
  } 
  else if (!regex.test(input)) {
    alert(`${input} is not a pokemon.`);
    return 2;
  }
  return 0;
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

const formatUnit = (number) => number / 10;

const getStatPct = (number) => Number((number * 100 / 255).toFixed(2));

const generateStatWidth = (number) => number > 0 
  ? `style="width: ${getStatPct(number)}%"`
  : `style="width: ${getStatPct(number)}%; border: none"`;

function generateStats(arr) {
  const stats = {};

  arr.forEach((statObj) => {
    stats[statObj.stat.name] = statObj.base_stat;
  });

  return `
    <div>
      <div>
        <img src="images/stat-icons/hp.png" alt="hp icon">
        <p id="hp">${stats.hp}</p>
      </div>
      <div class="bar-container">
        <div class="hp-bar" ${generateStatWidth(stats.hp)}></div>
        <div></div>
      </div>
    </div>
    <div>
      <div>
        <img src="images/stat-icons/attack.png" alt="attack icon">
        <p id="attack">${stats.attack}</p>
      </div>
      <div class="bar-container">
        <div class="attack-bar" ${generateStatWidth(stats.attack)}></div>
        <div></div>
      </div>
    </div>
    <div>
      <div>
        <img src="images/stat-icons/defense.png" alt="defense icon">
        <p id="defense">${stats.defense}</p>
      </div>
      <div class="bar-container">
        <div class="defense-bar" ${generateStatWidth(stats.defense)}></div>
        <div></div>
      </div>
    </div>
    <div>
      <div>
        <img src="images/stat-icons/sp-atk.png" alt="special attack icon">
        <p id="special-attack">${stats['special-attack']}</p>
      </div>
      <div class="bar-container">
        <div class="sp-atk-bar" ${generateStatWidth(stats['special-attack'])}></div>
        <div></div>
      </div>
    </div>
    <div>
      <div>
        <img src="images/stat-icons/sp-def.png" alt="special defense icon">
        <p id="special-defense">${stats['special-defense']}</p>
      </div>
      <div class="bar-container">
        <div class="sp-def-bar" ${generateStatWidth(stats['special-defense'])}></div>
        <div></div>
      </div>
    </div>
    <div>
      <div>
        <img src="images/stat-icons/speed.png" alt="speed icon">
        <p id="speed">${stats.speed}</p>
      </div>
      <div class="bar-container">
        <div class="speed-bar" ${generateStatWidth(stats.speed)}></div>
        <div></div>
      </div>
    </div>
  `;
}

function generateAbility(arr) {
  return arr.map((ability) => {
    if (!ability.is_hidden) {
      return `
        <div>
          <p>${ability.ability.name}</p>
          <span id="${ability.ability.name}" class="material-symbols-outlined ability-info-icon">help</span>
        </div>
      `;
    } 
    else {
      return `
        <div>
          <p class="hidden-ability">${ability.ability.name}</p>
          <span class="material-symbols-outlined hidden-ability-info-icon" id="${ability.ability.name}">help</span>
        </div>
      `;
    }
  }).join('');
}

const generateHiddenTag = (e) => e.target.matches('.hidden-ability-info-icon') ? ' (hidden)' : '';

function generateAbilityEvent() {
  const abilitesContainerLm = document.getElementById('abilities-container');
  const infoContainerLm = document.getElementById('pokemon-ability-info');

  abilitesContainerLm.addEventListener('click', (e) => {
    if (e.target.matches('span')) {
      const abilityName = e.target.id;
      getPokemonAbilityData(abilityName)
      .then((abilitydata) => {
        hideAbilityInfoLoading();
        infoContainerLm.style.display = "block";

        infoContainerLm.innerHTML = `
          <p>Ability information</p>
          <button class="ability-close-icon-btn">
            <span id="ability-close-icon" class="material-symbols-outlined ability-close-icon">cancel</span>
          </button>
          <h3 class="ability-name">${abilitydata.names.find((obj) => obj.language.name === 'en').name}${generateHiddenTag(e)}</h3>
          <p class="ability-summary">${formatSummary(abilitydata.flavor_text_entries.find((entry) => entry.language.name === 'en').flavor_text)}</p>
        `;

        const closeIconLm = document.getElementById('ability-close-icon');
        closeIconLm.addEventListener('click', () => {
          infoContainerLm.style.display = 'none';
        });
      })
      .catch((err) => {
        hideAbilityInfoLoading();
        console.error(err);
      });
    }
  });
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

  if (!secondEnSummary) {
    return 'No additional entry has been found.';
  }

  return secondEnSummary;
}

function changeSummary(summaryLm, entriesArr, callback, classToAdd) {
  summaryLm.className = classToAdd;

  summaryLm.innerText = callback(entriesArr).constructor === Object 
    ? formatSummary(callback(entriesArr).summary)
    : formatSummary(callback(entriesArr));
}

function displayActivePokeball(e, activePokeball, hiddenPokeball) {
  if (!e.target.matches('.active-pokeball')) {
    activePokeball.classList.remove('active-pokeball');
    e.target.classList.add('active-pokeball');
    const currPokeballBw = document.getElementById(`${e.target.id}-bw`);

    if (!currPokeballBw.matches('.hidden-pokeball-bw')) {
      hiddenPokeball.classList.remove('hidden-pokeball-bw');
      currPokeballBw.classList.add('hidden-pokeball-bw');
    }
  }
}

function generatePokeSummaryEvent(entriesArr) {
  const pokemonSummaryLm = document.getElementById('pokemon-summary');
  const allPokeballImgLm = document.querySelectorAll('.summary-versions img');
  const pokeballLm = document.getElementById('pokeball');
  const pokeballBwLm = document.getElementById('pokeball-bw');

  if (pokemonSummaryLm.matches('.summary-1')) {
    pokeballLm.classList.add('active-pokeball');
    pokeballBwLm.classList.add('hidden-pokeball-bw');
  }

  document.getElementById('summary-versions').addEventListener('click', (e) => {
    const activePokeball = [...allPokeballImgLm].find((element) => element.matches('.active-pokeball'));
    const hiddenPokeball = [...allPokeballImgLm].find((element) => element.matches('.hidden-pokeball-bw'));

    if (e.target.parentElement.matches('.summary-option-1-btn') && pokemonSummaryLm.classList.contains('summary-2')) {
      changeSummary(pokemonSummaryLm, entriesArr, getFirstEnSummary, 'summary-1');
      displayActivePokeball(e, activePokeball, hiddenPokeball);
    } 
    else if (e.target.parentElement.matches('.summary-option-2-btn') && pokemonSummaryLm.classList.contains('summary-1')) {
      changeSummary(pokemonSummaryLm, entriesArr, getSecondEnSummary, 'summary-2');
      displayActivePokeball(e, activePokeball, hiddenPokeball);
    }
  });
}

function getPokeAvbleGendrs(data) {
  const regexMale = /\bmale\b/;
  const regexFemale = /\bfemale\b/;

  if (data.pokemonData.forms.find((form) => regexMale.test(form.name))) {
    return '<span class="material-symbols-outlined">male</span>';
  } 
  else if (data.pokemonData.forms.find((form) => regexFemale.test(form.name))) {
    return '<span class="material-symbols-outlined">female</span>';
  }

  if (data.speciesData.gender_rate === 8) {
    return '<span class="material-symbols-outlined">female</span>';
  } 
  else if (data.speciesData.gender_rate === 0) {
    return '<span class="material-symbols-outlined">male</span>';
  } 
  else if (data.speciesData.gender_rate === -1) {
    return 'Unknown';
  } 
  else {
    return `
      <span class="material-symbols-outlined">male</span>
      <span class="material-symbols-outlined">female</span>
    `;
  }
}

function generateType(typeArr) {
  return typeArr.map((type) => `
  <div class="${type}-type">
    <img src="images/types/${type}-icon.png" alt="${type} type icon">
    <p>${type.toUpperCase()}</p>
  </div>
  `).join('');
}

function generateHTML(data) {
  const pokeContainerLm = document.getElementById('pokemon-container');

  pokeContainerLm.innerHTML = `
  <div class="sprite-name">
    <img class="pokemon-sprite" id="sprite" src="${data.pokemonData.sprites.front_default}" alt="${data.pokemonData.name} sprite">
    <h2 id="pokemon-name">${data.pokemonData.name.toUpperCase()} #${data.pokemonData.id}</h2>
  </div>
  <div class="pokemon-info">
    <div class="image-stats">
      <img src="${data.pokemonData.sprites.other['official-artwork'].front_default}" alt="${data.pokemonData.name} official artwork">
      <div class="pokemon-stats">
        ${generateStats(data.pokemonData.stats)}
      </div>
    </div>
    <div class="more-info">
      <p class="summary-1" id="pokemon-summary">${formatSummary(getFirstEnSummary(data.speciesData.flavor_text_entries).summary)}</p>
      <div id="summary-versions" class="summary-versions">
        <p>Versions: </p>
        <button class="summary-option-1-btn">
          <img class="pokeball-bw" id="pokeball-bw" src="images/pokeballs/pokeBall-bw.png" alt="pokeball black and white">
          <img class="pokeball" id="pokeball" src="images/pokeballs/pokeBall.png" alt="pokeball">
        </button>  
        <button class="summary-option-2-btn">
          <img class="superball-bw" id="superball-bw" src="images/pokeballs/superBall-bw.png" alt=""superball black and white>
          <img class="superball" id="superball" src="images/pokeballs/superBall.png" alt="superball">
        </button>
      </div>
      <div id="details-loading-container" class="details-loading-container">
        <p>Loading...</p>
        <img src="images/running-pikachu.gif" alt="pikachu running">
      </div>
      <div class="pokemon-details-container">
        <div id="pokemon-ability-info" class="pokemon-ability-info"></div>
        <div class="pokemon-details">
          <div class="first-info-section">
            <h3>Height</h3>
            <p id="height">${formatUnit(data.pokemonData.height)} m</p>
            <h3>Weight</h3>
            <p id="weight">${formatUnit(data.pokemonData.weight)} kg</p>
            <h3>Gender</h3>
            <div class="gender-types">
              ${getPokeAvbleGendrs(data)}
            </div>
          </div>
          <div class="second-info-section">
            <h3>Category</h3>
            <p>${formatCategory(data.speciesData.genera.find((genus) => genus.language.name === 'en').genus)}</p>
            <h3>Ablility</h3>
            <div id="abilities-container" class="abilities-container">
              ${generateAbility(data.pokemonData.abilities)}
            </div>
          </div>
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

  if (validateInput(searchVal)) {
    return;
  }

  getPokemonData(searchVal)
    .then((data) => {
      inputLm.value = '';
      hidePageTitle();
      hideLoading();
      generateHTML(data);
      generatePokeSummaryEvent(data.speciesData.flavor_text_entries);
      generateAbilityEvent();
    })
    .catch((err) => {
      hideLoading();
      console.error(err)
    });
}

searchBtnLm.addEventListener('click', displayPokemon);

inputLm.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    displayPokemon();
  }
});