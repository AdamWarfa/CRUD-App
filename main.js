"use strict";
window.addEventListener("load", initApp);

// Globale variabler

// Firebase variabel
const endPoint = "https://movie-db-99347-default-rtdb.europe-west1.firebasedatabase.app/";

// Tom variabel til vores filmdata
let movies;

// document.querySelector & addEventListener

// Start app funktion
function initApp() {
  globalEventListeners();
  updateMoviesGrid();
}

function globalEventListeners() {
  document.querySelector("#form-create-movie").addEventListener("submit", createMovieClicked);
  document.querySelector("#form-update-movie").addEventListener("submit", updateMovieClicked);
  document.querySelector("#form-delete-movie");
  addEventListener("submit", deleteMovieClicked);
  document.querySelector("#btn-create-movie").addEventListener("click", showCreateMovieDialog);

  document.querySelector("#input-search").addEventListener("keyup", inputSearchChanged);
  document.querySelector("#input-search").addEventListener("search", inputSearchChanged);
}

async function updateMoviesGrid() {
  const movies = await getMovies();
  showMovies(movies);
}

async function getMovies() {
  // Fetch JSON data fra vores database
  const response = await fetch(`${endPoint}/movies.json`);
  const data = await response.json();
  const movies = prepareMovieData(data);

  return movies;
}

function prepareMovieData(dataObject) {
  const movieArray = [];

  // for in som pusher fetchede JSON data ind i vores array
  for (const key in dataObject) {
    try {
      const movie = dataObject[key];
      movie.id = key;
      movieArray.push(movie);
    } catch (error) {
      console.log(`Nogen har ødelagt vores film så de giver ${dataObject[key]}`);
    }
  }
  console.log(movieArray);
  return movieArray;
}

function showMovies(listOfMovies) {
  document.querySelector("#grid").innerHTML = "";

  /* 
  Når man laver et nyt "create post", giver den fejlbesked i konsollen, da objektets datastruktur ikke stemmer overens med databasen.
  Derfor implementerede vi en try catch som gerne skulle fange fejlbeskederne.
  */
  for (const movie of listOfMovies) {
    try {
      showMovie(movie);
    } catch (error) {
      console.log(error);
    }
  }
}

// Funktion til DOM-manipulation
function showMovie(movieObject) {
  let movieGenre = getGenre(movieObject);

  document.querySelector("#grid").insertAdjacentHTML(
    "beforeend",
    /*html*/ `

<article class="list-entry">
  <img id="list-image" src = "${movieObject.posterUrl}"/>
  <h2 id="list-title">${movieObject.title}</h2>
  <p id="list-director">${movieObject.director}</p>
  <p id="list-genre">${movieGenre}</p>
  <p id="list-runtime" >Runtime: ${movieObject.runtime} minutes (${movieObject.year})</p>
  <button id="btn-update">UPDATE</button>
  <button id="btn-delete">DELETE</button>
</article>
`
  );

  // Click events til at åbne, slette og opdatere film
  document.querySelector("#grid article:last-child img").addEventListener("click", () => movieClicked(movieObject));
  document.querySelector("#grid article:last-child #btn-delete").addEventListener("click", () => deleteClicked(movieObject));
  document.querySelector("#grid article:last-child #btn-update").addEventListener("click", () => updateClicked(movieObject));

  // Cancel knapper der kan lukke et åbnet film dialog
  document.querySelector(".btn-cancel").addEventListener("click", closeDialog);
  document.querySelector("#btn-cancel-update-movie").addEventListener("click", closeDialog);
}

function movieClicked(movieObject) {
  // Viser titel, director, udgivelsesår, spilletid, genre(r), billede, plottet og hovedroller på film, når filmen er blevet klikket på
  document.querySelector("#dialog-title").textContent = `${movieObject.title}`;
  document.querySelector("#dialog-director").textContent = `Director: ${movieObject.director}`;
  document.querySelector("#dialog-year").textContent = `Release year: ${movieObject.year}`;
  ddocument.querySelector("#dialog-runtime").textContent = `Runtime: ${movieObject.runtime} minutes`;
  document.querySelector("#dialog-genres").textContent = `Genres: ${movieGenre}`;
  document.querySelector("#dialog-img").src = `${movieObject.posterUrl}`;
  document.querySelector("#dialog-plot").textContent = `Plot: ${movieObject.plot}`;
  document.querySelector("#dialog-actors").textContent = `Main Cast: ${movieObject.actors}`;

  document.querySelector("#dialog-movie").showModal();

  // Gør baggrunden mørkere, så dialogen fremstår mere klart
  document.querySelector("#background").classList.add("dim");
  document.querySelector("header").classList.add("dim");
  document.querySelector("#grid").classList.add("dim");

  // Lukker dialog
  document.querySelector("#btn-close").addEventListener("click", closeDialog);
}

function deleteClicked(movieObject) {
  document.querySelector("#dialog-delete-movie-title").textContent = movieObject.title;
  document.querySelector("#form-delete-movie").setAttribute("data-id", movieObject.id);
  document.querySelector("#dialog-delete-movie").showModal();
  document.querySelector("#background").classList.add("dim");
  document.querySelector("header").classList.add("dim");
  document.querySelectors("#grid").classList.add("dim");
}

function updateClicked(movieObject) {
  const updateForm = document.querySelector("#form-update-movie");

  updateForm.title.value = movieObject.title;
  updateForm.director.value = movieObject.director;
  updateForm.year.value = movieObject.year;
  updateForm.runtime.value = movieObject.runtime;
  updateForm.plot.value = movieObject.plot;
  updateForm.actors.value = movieObject.actors;
  updateForm.posterUrl.value = movieObject.posterUrl;
  updateForm.setAttribute("data-id", movieObject.id);

  document.querySelector("#dialog-update-movie").showModal();
  document.querySelector("#background").classList.add("dim");
  document.querySelector("header").classList.add("dim");
  document.querySelector("#grid").classList.add("dim");
}

function getGenre(movie) {
  // ? - (optional chaining) en teknik fundet på StackOverflow som returnerer "undefined", hvis et objekt ikke opfylder datastrukturen, i stedet for at give en fejl i konsollen.
  let genreString = movie.genres?.toString();
  let genreFirst = genreString?.split(",")[0];
  let genreSecond = genreString?.split(",")[1];
  // Vis kun et maksimum af 2 genrer på frontsiden af CRUD app.
  let movieGenre = `${genreFirst} & ${genreSecond}`;

  // Nogle film har kun 1 genre. Hvis genre nummer er 1< og giver undefined, vis kun første genre.
  if (genreSecond == undefined) {
    movieGenre = `${genreFirst}`;
  }

  return movieGenre;
}

function updateMovieClicked(event) {
  event.preventDefault();

  const form = event.target;
  const title = form.title.value;
  const director = form.director.value;
  const year = form.year.value;
  const runtime = form.runtime.value;
  const plot = form.plot.value;
  const actors = form.actors.value;
  const posterUrl = form.posterUrl.value;
  const id = form.getAttribute("data-id");
  const genres = [form.genres.value];

  console.log("Update  clicked!", id);

  updateMovie(title, director, year, runtime, plot, actors, posterUrl, genres, id);
  closeDialog();
}

async function updateMovie(title, director, year, runtime, plot, actors, posterUrl, genres, id) {
  // Laver objekt med opdateret filminformation
  const movieToUpdate = {
    title,
    director,
    year,
    runtime,
    plot,
    actors,
    posterUrl,
    genres,
    id,
  };
  const json = JSON.stringify(movieToUpdate);

  const response = await fetch(`${endPoint}/movies/${id}.json`, {
    method: "PUT",
    body: json,
  });

  // Tjekker hvis response er okay, hvis response er succesfuld ->
  if (response.ok) {
    // Opdater MoviesGrid til at displaye all film og den nye film
    updateMoviesGrid();
  }
}

function showCreateMovieDialog() {
  document.querySelector("#dialog-create-movie").showModal();
  document.querySelector("#background").classList.add("dim");
  document.querySelector("header").classList.add("dim");
  document.querySelector("#grid").classList.add("dim");

  document.querySelector("#btn-cancel-create-movie").addEventListener("click", closeDialog);
}

// Funktion der laver nyt objekt med filminformation
async function createMovie(title, director, year, runtime, plot, actors, posterUrl, genres, id) {
  const newMovie = {
    title: title,
    director: director,
    year: year,
    runtime: runtime,
    plot: plot,
    actors: actors,
    posterUrl: posterUrl,
    genres: genres,
    id: id,
  };
  const json = JSON.stringify(newMovie);

  const response = await fetch(`${endPoint}/movies.json`, {
    method: "POST",
    body: json,
  });
  // Tjekker hvis response er okay, hvis response er succesfuld ->
  if (response.ok) {
    console.log("New movie succesfully added to Firebase 🔥");
    // Opdater MoviesGrid til at displaye all film og den nye film
    updateMoviesGrid();
  }
}

// Create movie click event
function createMovieClicked(event) {
  event.preventDefault();

  const form = event.target;
  const title = form.title.value;
  const director = form.director.value;
  const year = form.year.value;
  const runtime = form.runtime.value;
  const plot = form.plot.value;
  const actors = form.actors.value;
  const posterUrl = form.posterUrl.value;
  const id = form.getAttribute("data-id");
  const genres = [form.genres.value];

  createMovie(title, director, year, runtime, plot, actors, posterUrl, genres, id);
  form.reset();
  closeDialog();
}

function closeDialog() {
  // Lukker dialog, fjerner formørkelse af baggrund
  document.querySelector("#dialog-movie").close();
  document.querySelector("#dialog-create-movie").close();
  document.querySelector("#dialog-delete-movie").close();
  document.querySelector("#dialog-update-movie").close();
  document.querySelector("#background").classList.remove("dim");
  document.querySelector("header").classList.remove("dim");
  document.querySelector("#grid").classList.remove("dim");
}

function deleteMovieClicked(event) {
  event.preventDefault();

  const form = event.target;
  const id = form.getAttribute("data-id");
  console.log("Delete  clicked!", id);

  deleteMovie(id);
  form.reset();

  closeDialog();
}

async function deleteMovie(id) {
  const response = await fetch(`${endPoint}/movies/${id}.json`, {
    method: "DELETE",
  });
  if (response.ok) {
    updateMoviesGrid();
  }
}

async function inputSearchChanged(event) {
  const search = event.target.value;
  // console.log(search);
  const newMovieList = await searchMovies(search);
  // console.log(newMovieList);
  showMovies(newMovieList);
}

async function searchMovies(searchValue) {
  const movies = await getMovies();
  return movies.filter((movie) => movie.title.toLowerCase().includes(searchValue.toLowerCase()));
}

//to do:
/*
Teknologier og programmeringskoncepter
HTML, CSS og JavaScript - du må ikke anvende libraries eller frameworks, heller ikke CSS stylesheets, som du ikke selv har skrevet. Du må gerne lade dig inspirere af fx csslayout.io, w3schools, eksisterende GitHub Repositories - men lad være med at kopiere direkte.
Events, DOM-manipulation, variabler, objekter, arrays, loops, funktioner med parametre og returværdier, events
Anvendelse af et REST API og BaaS (backend as a service)
Anvendelse af await, async, fetch og HTTP-metoderne GET, POST, PUT/PATCH og DELETE
Formularer med typer, valideringen og restriktioner
Fejlhåndtering i forbindelse med HTTP status-koder
Submit-event(s)
Array-metoder som fx .filter, .sort, .find
Modules, import og export samt Separation of Concerns - din kode skal være opdelt i mindre specialiserede dele (funktioner og moduler) for at opnå god struktur.
HTML-elementer som fx ul, ol, li, header, section, footer, form, label, button, input, og relaterede
CSS Grid, CSS Flex og/eller HTML Table
Git til samarbejde 

Aflevering
Som gruppe skal I aflevere en PDF med:

Aktivitetsdiagrammer
Et link til jeres kodebase på GitHub
Et link til jeres kørende løsning på GitHub Pages
Et screenshot af data fra jeres BaaS

*/
