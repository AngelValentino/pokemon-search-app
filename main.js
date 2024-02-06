const inputLm = document.getElementById('search-input');
const searchBtnLm = document.getElementById('search-button');
const url = 'https://pokeapi.co/api/v2/pokemon/'


async function getPokemonData(srchVal) {
  const response = await fetch(url + srchVal)

  if (response.status !== 200) {
    alert("Pokémon not found");
    throw new Error("Couldn't fetch the data");
  } 
  
  const pokemonData = await response.json();
  return pokemonData;
}

function generateType(arr) {
  return arr.map((type) => `<p>${type.toUpperCase()}</p>`).join('');
}

function generateHTML(data) {
  const pokeContainerLm = document.getElementById('pokemon-container')
  pokeContainerLm.innerHTML = `
  <div class="sprite-name">
    <img id="sprite" src="${data.sprites.front_default}" alt="">
    <h2 id="pokemon-name">${data.name.toUpperCase()}&nbsp</h2>
    <h2 id="pokemon-id">#${data.id}</h2>
  </div>
  <div class="pokemon-info">
    <div class="image-stats">
      <img src="${data.sprites.other['official-artwork']['front_default']}" alt="">
      <div class="pokemon-stats">
        <div>
          <h4>HP:</h4>
          <p id="hp">${data.stats[0]['base_stat']}</p>
        </div>
        <div>
          <h4>Attack:</h4>
          <p id="attack">${data.stats[1]['base_stat']}</p>
        </div>
        <div>
          <h4>Deffense:</h4>
          <p id="defense">${data.stats[2]['base_stat']}</p>
        </div>
        <div>
          <h4>Sp. Attack:</h4>
          <p id="special-attack">${data.stats[3]['base_stat']}</p>
        </div>
        <div>
          <h4>Sp. Defense</h4>
          <p id="special-defense">${data.stats[4]['base_stat']}</p>
        </div>
        <div>
          <h4>Speed:</h4>
          <p id="speed">${data.stats[5]['base_stat']}</p>
        </div>
      </div>
    </div>
    <div class="more-info">
      <p>La llama de su cola indica su fuerza vital. Si está débil, la llama arderá más tenue.</p>
      <p>Versions: <span>1</span> <span>2</span></p>
      <div class="pokemon-details">
        <div>
          <h4>Height</h4>
          <p id="height">${data.height}</p>
          <h4>Weight</h4>
          <p id="weight">${data.weight}</p>
          <h4>Gender</h4>
          <p>M F</p>
        </div>
        <div>
          <h4>Category</h4>
          <p>Lizard</p>
          <h4>Ablility</h4>
          <p>Mar llamas</p>
        </div>
      </div>
      <h3>Type</h3>
      <div id="types">
        ${generateType(data.types.map((obj) => obj.type.name))}
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
      generateHTML(data);
    })
    .catch((err) => console.error(err));
}


searchBtnLm.addEventListener('click', displayPokemon);