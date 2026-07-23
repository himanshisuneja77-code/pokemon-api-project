const pokemonContainer = document.getElementById("pokemonContainer");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const loading = document.getElementById("loading");

let offset = 0;
const limit = 20;
let allPokemon = [];

// Fetch 20 Pokémon at a time
async function fetchPokemon() {
    loading.style.display = "block";

    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
        );

        const data = await response.json();

        const pokemonList = await Promise.all(
            data.results.map(async (pokemon) => {
                const response = await fetch(pokemon.url);
                return await response.json();
            })
        );

        allPokemon.push(...pokemonList);

        displayPokemon(pokemonList);

        offset += limit;

    } catch (error) {
        console.log(error);
    }

    loading.style.display = "none";
}

// Fetch Pokémon Types
async function fetchTypes() {
    try {
        const response = await fetch(
            "https://pokeapi.co/api/v2/type/?offset=0&limit=21"
        );

        const data = await response.json();

        data.results.forEach((type) => {
            const option = document.createElement("option");

            option.value = type.name;
            option.textContent = type.name;

            typeFilter.appendChild(option);
        });

    } catch (error) {
        console.log(error);
    }
}

// Display Pokémon Cards
function displayPokemon(pokemonArray) {

    pokemonArray.forEach((pokemon) => {

        const card = document.createElement("div");

        card.classList.add("card");

        card.innerHTML = `
            <div class="card-inner">

                <div class="card-front">

                    <img
                        src="${pokemon.sprites.other["official-artwork"].front_default}"
                        alt="${pokemon.name}"
                    >

                    <h2>${pokemon.name}</h2>

                    <p>
                        ${pokemon.types.map(t => t.type.name).join(", ")}
                    </p>

                </div>

                <div class="card-back">

                    <h2>${pokemon.name}</h2>

                    <p>⭐ Ability: ${pokemon.abilities[0].ability.name}</p>

                    <p>📏 Height: ${pokemon.height}</p>

                    <p>⚖️ Weight: ${pokemon.weight}</p>

                    <p>🏆 Exp: ${pokemon.base_experience}</p>

                </div>

            </div>
        `;

        // Flip card
        card.addEventListener("click", () => {
            card.classList.toggle("flip");
        });

        pokemonContainer.appendChild(card);
    });
}

// Search Pokémon by Name
async function searchPokemon() {

    const value = searchInput.value.toLowerCase().trim();

    if (value === "") {

        pokemonContainer.innerHTML = "";

        displayPokemon(allPokemon);

        loadMoreBtn.style.display = "inline-block";

        return;
    }

    loading.style.display = "block";

    pokemonContainer.innerHTML = "";

    typeFilter.value = "all";

    try {

        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${value}`
        );

        if (!response.ok) {

            pokemonContainer.innerHTML =
                "<h2>Pokémon Not Found</h2>";

            loadMoreBtn.style.display = "none";

            loading.style.display = "none";

            return;
        }

        const pokemon = await response.json();

        displayPokemon([pokemon]);

        loadMoreBtn.style.display = "none";

    } catch (error) {

        console.log(error);

    }

    loading.style.display = "none";
}

// Filter Pokémon by Type
function filterType() {

    const type = typeFilter.value;

    pokemonContainer.innerHTML = "";

    if (type === "all") {

        displayPokemon(allPokemon);

        loadMoreBtn.style.display = "inline-block";

        return;
    }

    const filteredPokemon = allPokemon.filter((pokemon) =>
        pokemon.types.some(
            (t) => t.type.name === type
        )
    );

    displayPokemon(filteredPokemon);

    loadMoreBtn.style.display = "none";
}

searchBtn.addEventListener("click", searchPokemon);

searchInput.addEventListener("keyup", (event) => {

    if (event.key === "Enter") {
        searchPokemon();
    }

});


typeFilter.addEventListener("change", filterType);

loadMoreBtn.addEventListener("click", fetchPokemon);


fetchPokemon();

fetchTypes();