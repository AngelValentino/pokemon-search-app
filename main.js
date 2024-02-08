const inputLm = document.getElementById('search-input');
const searchBtnLm = document.getElementById('search-button');
const url = 'https://pokeapi.co/api/v2/pokemon/';

// do something if a rendered object property doesn't exist in the json file
// return 'Entry has not been found'

async function getPokemonData(srchVal) {
  const response = await fetch(url + srchVal);

  if (response.status !== 200) {
    alert("Pokémon not found");
    throw new Error("Couldn't fetch the data.");
  } 
  
  const pokemonData = await response.json();
  const responseSpecies = await fetch(pokemonData.species.url);

  if (responseSpecies.status !== 200) {
    throw new Error("Couldn't fetch the species data.");
  }  

  const speciesData = await responseSpecies.json();
  return {pokemonData, speciesData};
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

function generateType(arr) {
  return arr.map((type) => `<p>${type.toUpperCase()}</p>`).join('');
}

function formatCategory(string) {
  const regex = /\spok(?:e|é)mon/i;
  return string.replace(regex, '');
}

function formatEntryText(string) {
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

function getFirstEnEntry(entriesArr) {
  let firstEnEntry = '';
  let matchIndex = 0;

  for (let i = 0; i < entriesArr.length; i++) {
    if (entriesArr[i].language.name === 'en') {
      firstEnEntry = entriesArr[i].flavor_text;
      matchIndex = i;
      break;
    }
  }

  return {entry: firstEnEntry, index: matchIndex};
} 

function getSecondEnEntry(entriesArr) {
  const entryObj = getFirstEnEntry(entriesArr);
  let secondEnEntry = '';

  for (let i = entryObj.index + 1; i < entriesArr.length; i++) {
    if (entriesArr[i].language.name === 'en' && entriesArr[i].flavor_text !== entryObj.entry) {
      secondEnEntry = entriesArr[i].flavor_text;
      break;
    }
  }

  if(!secondEnEntry) {
    return 'No additional entry has been found.';
  }

  return secondEnEntry;
}

function changeEntry(entryLm, entriesArr, callback, entryClassToRemove, entryClassToAdd) {
  entryLm.classList.remove(entryClassToRemove);
  entryLm.classList.add(entryClassToAdd);

  entryLm.innerText = callback(entriesArr).constructor === Object 
    ? formatEntryText(callback(entriesArr).entry)
    : formatEntryText(callback(entriesArr));
}

function generateEntryEvent(entriesArr) {
  const pokemonEntryLm = document.getElementById('pokemon-entry');

  document.getElementById('entry-versions').addEventListener('click', (e) => {
    if (e.target.matches('.entry-option-1') && pokemonEntryLm.classList.contains('entry-2')) {
      changeEntry(pokemonEntryLm, entriesArr, getFirstEnEntry, 'entry-2', 'entry-1');
    } 
    else if (e.target.matches('.entry-option-2') && pokemonEntryLm.classList.contains('entry-1')) {
      changeEntry(pokemonEntryLm, entriesArr, getSecondEnEntry, 'entry-1', 'entry-2');
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

function generateHTML(data) {
  const pokeContainerLm = document.getElementById('pokemon-container');

  pokeContainerLm.innerHTML = `
  <div class="sprite-name">
    <img id="sprite" src="${data.pokemonData.sprites.front_default}" alt="">
    <h2 id="pokemon-name">${data.pokemonData.name.toUpperCase()}&nbsp</h2>
    <h2 id="pokemon-id">#${data.pokemonData.id}</h2>
  </div>
  <div class="pokemon-info">
    <div class="image-stats">
      <img src="${data.pokemonData.sprites.other['official-artwork'].front_default}" alt="">
      <div class="pokemon-stats">
        <div>
          <h4>HP:</h4>
          <p id="hp">${data.pokemonData.stats[0].base_stat}</p>
        </div>
        <div>
          <h4>Attack:</h4>
          <p id="attack">${data.pokemonData.stats[1].base_stat}</p>
        </div>
        <div>
          <h4>Deffense:</h4>
          <p id="defense">${data.pokemonData.stats[2].base_stat}</p>
        </div>
        <div>
          <h4>Sp. Attack:</h4>
          <p id="special-attack">${data.pokemonData.stats[3].base_stat}</p>
        </div>
        <div>
          <h4>Sp. Defense</h4>
          <p id="special-defense">${data.pokemonData.stats[4].base_stat}</p>
        </div>
        <div>
          <h4>Speed:</h4>
          <p id="speed">${data.pokemonData.stats[5].base_stat}</p>
        </div>
      </div>
    </div>
    <div class="more-info">
      <p class="entry-1" id="pokemon-entry">${formatEntryText(getFirstEnEntry(data.speciesData.flavor_text_entries).entry)}</p>
      <p id="entry-versions" class="entry-versions">Versions: <span class="entry-option-1">1</span> <span class="entry-option-2">2</span></p>
      <div class="pokemon-details">
        <div>
          <h4>Height</h4>
          <p id="height">${data.pokemonData.height}</p>
          <h4>Weight</h4>
          <p id="weight">${data.pokemonData.weight}</p>
          <h4>Gender</h4>
          <p id="gender-types">M F</p>
        </div>
        <div>
          <h4>Category</h4>
          <p>${formatCategory(data.speciesData.genera.find((genus) => genus.language.name === 'en').genus)}</p>
          <h4>Ablility</h4>
          <p>${generateAbility(data.pokemonData.abilities)}</p>
        </div>
      </div>
      <h3>Type</h3>
      <div id="types">
        ${generateType(data.pokemonData.types.map((obj) => obj.type.name))}
      </div>
    </div>
  </div>
  `;
}

function displayPokemon() {
  const searchVal = inputLm.value.toLowerCase();
  
  getPokemonData(searchVal)
    .then((data) => {
      console.log(data);
      const entriesArr = data.speciesData.flavor_text_entries;
      console.log(entriesArr);
      console.log(data.speciesData.gender_rate);

      generateHTML(data);
      getPokeAvbleGendrs(data);
      generateEntryEvent(entriesArr);
    })
    .catch((err) => console.error(err));
}


searchBtnLm.addEventListener('click', displayPokemon);