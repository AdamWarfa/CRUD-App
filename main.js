"use strict";
window.addEventListener("load", initApp);

// Globale variabler

// Firebase variabel
const endPoint = "https://movie-db-99347-default-rtdb.europe-west1.firebasedatabase.app/";

// Tom variabel til vores filmdata
let movies;

// document.querySelector & addEventListener
document.querySelector = d.qs;
addEventListener = eListener;

// Start app funktion
function initApp() {
  globalEventListeners();
  updateMoviesGrid();
}

function globalEventListeners() {
  d.qs("#form-create-movie").eListener("submit", createMovieClicked);
  d.qs("#form-update-movie").eListener("submit", updateMovieClicked);
  d.qs("#form-delete-movie").eListener("submit", deleteMovieClicked);
  d.qs("#btn-create-movie").eListener("click", showCreateMovieDialog);

  d.qs("#input-search").eListener("keyup", inputSearchChanged);
  d.qs("#input-search").eListener("search", inputSearchChanged);
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
    const movie = dataObject[key];
    movie.id = key;
    movieArray.push(movie);
  }
  console.log(movieArray);
  return movieArray;
}

function showMovies(listOfMovies) {
  d.qs("#grid").innerHTML = "";

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

  d.qs("#grid").insertAdjacentHTML(
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
  d.qs("#grid article:last-child img").eListener("click", () => movieClicked(movieObject));
  d.qs("#grid article:last-child #btn-delete").eListener("click", () => deleteClicked(movieObject));
  d.qs("#grid article:last-child #btn-update").eListener("click", () => updateClicked(movieObject));

  // Cancel knapper der kan lukke et åbnet film dialog
  d.qs(".btn-cancel").eListener("click", closeDialog);
  d.qs("#btn-cancel-update-movie").eListener("click", closeDialog);
}

function movieClicked(movieObject) {
  // Viser titel, director, udgivelsesår, spilletid, genre(r), billede, plottet og hovedroller på film, når filmen er blevet klikket på
  d.qs("#dialog-title").textContent = `${movieObject.title}`;
  d.qs("#dialog-director").textContent = `Director: ${movieObject.director}`;
  d.qs("#dialog-year").textContent = `Release year: ${movieObject.year}`;
  d.qs("#dialog-runtime").textContent = `Runtime: ${movieObject.runtime} minutes`;
  d.qs("#dialog-genres").textContent = `Genres: ${movieGenre}`;
  d.qs("#dialog-img").src = `${movieObject.posterUrl}`;
  d.qs("#dialog-plot").textContent = `Plot: ${movieObject.plot}`;
  d.qs("#dialog-actors").textContent = `Main Cast: ${movieObject.actors}`;

  d.qs("#dialog-movie").showModal();

  // Gør baggrunden mørkere, så dialogen fremstår mere klart
  d.qs("#background").classList.add("dim");
  d.qs("header").classList.add("dim");
  d.qs("#grid").classList.add("dim");

  // Lukker dialog
  d.qs("#btn-close").eListener("click", closeDialog);
}

function deleteClicked(movieObject) {
  d.qs("#dialog-delete-movie-title").textContent = movieObject.title;
  d.qs("#form-delete-movie").setAttribute("data-id", movieObject.id);
  d.qs("#dialog-delete-movie").showModal();
  d.qs("#background").classList.add("dim");
  d.qs("header").classList.add("dim");
  d.qs("#grid").classList.add("dim");
}

function updateClicked(movieObject) {
  const updateForm = d.qs("#form-update-movie");

  updateForm.title.value = movieObject.title;
  updateForm.director.value = movieObject.director;
  updateForm.year.value = movieObject.year;
  updateForm.runtime.value = movieObject.runtime;
  updateForm.plot.value = movieObject.plot;
  updateForm.actors.value = movieObject.actors;
  updateForm.posterUrl.value = movieObject.posterUrl;
  updateForm.setAttribute("data-id", movieObject.id);

  d.qs("#dialog-update-movie").showModal();
  d.qs("#background").classList.add("dim");
  d.qs("header").classList.add("dim");
  d.qs("#grid").classList.add("dim");
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
  const movieToUpdate = { title, director, year, runtime, plot, actors, posterUrl, genres, id };
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
  d.qs("#dialog-create-movie").showModal();
  d.qs("#background").classList.add("dim");
  d.qs("header").classList.add("dim");
  d.qs("#grid").classList.add("dim");

  d.qs("#btn-cancel-create-movie").eListener("click", closeDialog);
}

// Funktion der laver nyt objekt med filminformation
async function createMovie(title, director, year, runtime, plot, actors, posterUrl, genres, id) {
  const newMovie = { title: title, director: director, year: year, runtime: runtime, plot: plot, actors: actors, posterUrl: posterUrl, genres: genres, id: id };
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
  d.qs("#dialog-movie").close();
  d.qs("#dialog-create-movie").close();
  d.qs("#dialog-delete-movie").close();
  d.qs("#dialog-update-movie").close();
  d.qs("#background").classList.remove("dim");
  d.qs("header").classList.remove("dim");
  d.qs("#grid").classList.remove("dim");
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

function inputSearchChanged(event) {
  console.log(moviesToShow);
  showMovies(searchMovies(event.target.value));
}

function searchMovies(searchValue) {
  if (movies) {
    const filteredMovies = movies.filter(movie => {
      // filter movies based on search term
      return movie.title.toLowerCase().includes(searchValue.toLowerCase());
    });
    // display filtered movies
    showMovies(filteredMovies);
  }
  // searchValue = searchValue.toLowerCase();

  // const results = movies.filter(checkTitle);

  // function checkTitle(movie) {
  //   const title = movie.title.toLowerCase();
  //   console.log(title);
  //   return title.includes(searchValue);
  // }

  // return results;
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
