"use strict";
window.addEventListener("load", initApp);
const endPoint = "https://movie-db-99347-default-rtdb.europe-west1.firebasedatabase.app/";

let movies;

function initApp() {
  updateMoviesGrid();
  // const movieobject = parseJSONString('{"title": “This is my awesome title”, "image": “https://share.cederdorff.com/images/petl.jpg" }');
  // console.log(movieobject);
  document.querySelector("#form-create-movie").addEventListener("submit", createMovieClicked);
  document.querySelector("#form-update-movie").addEventListener("submit", updateMovieClicked);
  document.querySelector("#form-delete-movie").addEventListener("submit", deleteMovieClicked);
  document.querySelector("#btn-create-movie").addEventListener("click", showCreateMovieDialog);
  
  document.querySelector("#input-search").addEventListener("keyup", inputSearchChanged);
  document.querySelector("#input-search").addEventListener("search", inputSearchChanged);
}

async function updateMoviesGrid() {
  const movies = await getMovies();
  showMovies(movies);
}

async function getMovies() {
  const response = await fetch(`${endPoint}/movies.json`);
  const data = await response.json();
  const movies = preparedMovieData(data);

  return movies;
}

function preparedMovieData(dataObject) {
  const movieArray = [];
  for (const key in dataObject) {
    const movie = dataObject[key];
    movie.id = key;
    console.log(movie);
    movieArray.push(movie);
  }
  console.log(movieArray);
  return movieArray;
}

function showMovies(listOfMovies) {
  document.querySelector(".grid").innerHTML = "";

  for (const movie of listOfMovies) {
    showMovie(movie);
  }
}

function showMovie(movieObject) {
  let genreString = movieObject.genres.toString();
  let genreFirst = genreString.split(",")[0].trim();
  let genreSecond = genreString.split(",")[1].trim();
  console.log(genreSecond);

  document.querySelector(".grid").insertAdjacentHTML(
    "beforeend",
    /*html*/ `

<article class="list-entry">
<h2 id="list-title">${movieObject.title}</h2>
    <img id="list-image" src = "${movieObject.posterUrl}"/>
    <p id="list-director">${movieObject.director}</p>
    <p id="list-genre">${genreFirst} & ${genreSecond}</p>
    <button id="btn-update">UPDATE</button>
        <button id="btn-delete">DELETE</button>

</article>
`
  );

  // document.querySelector(".grid article:last-child").addEventListener("click", movieClicked);
  document.querySelector(".grid article:last-child img").addEventListener("click", movieClicked);
  document.querySelector(".grid article:last-child #btn-delete").addEventListener("click", deleteClicked);
  document.querySelector(".grid article:last-child #btn-update").addEventListener("click", updateClicked);

  document.querySelector(".btn-cancel").addEventListener("click", dialogClose);
  document.querySelector("#btn-cancel-update-movie").addEventListener("click", dialogClose);

  function movieClicked() {
    document.querySelector("#dialog-title").textContent = `${movieObject.title}`;
    document.querySelector("#dialog-id").textContent = `${movieObject.id}`;
    document.querySelector("#dialog-img").src = `${movieObject.posterUrl}`;

    document.querySelector("#dialog-movie").showModal();

    document.querySelector("#btn-close").addEventListener("click", dialogClose);
  }

  function deleteClicked() {
    document.querySelector("#dialog-delete-movie-title").textContent = movieObject.title;
    document.querySelector("#form-delete-movie").setAttribute("data-id", movieObject.id);
    document.querySelector("#dialog-delete-movie").showModal();
  }

  function updateClicked() {
    const updateForm = document.querySelector("#form-update-movie");
    updateForm.title.value = movieObject.title;
    updateForm.body.value = movieObject.body;
    updateForm.image.value = movieObject.image;
    updateForm.setAttribute("data-id", movieObject.id);
    document.querySelector("#dialog-update-movie").showModal();
    // to do
  }
}

function updateMovieClicked(event) {
  event.preventDefault();
  const form = event.target;
  const title = form.title.value;
  const body = form.body.value;
  const image = form.image.value;
  const id = form.getAttribute("data-id");
  console.log("Update  clicked!", id);
  updateMovie(id, title, body, image);
  document.querySelector("#dialog-update-movie").close();
}

async function updateMovie(id, title, body, image) {
  // create object with the updated movie information
  const movieToUpdate = { title, body, image };
  const json = JSON.stringify(movieToUpdate);

  const response = await fetch(`${endPoint}/movies/${id}.json`, {
    method: "PUT",
    body: json,
  });

  // Check if response is ok - if the response is successful
  if (response.ok) {
    // Update the movie grid to display all movies and the new movie
    updateMoviesGrid();
  }
}

function showCreateMovieDialog() {
  document.querySelector("#dialog-create-movie").showModal();
}

async function createMovie(title, body, image) {
  const newMovie = { title: title, body: body, image: image };
  const json = JSON.stringify(newMovie);

  const response = await fetch(`${endPoint}/movies.json`, {
    method: "POST",
    body: json,
  });
  if (response.ok) {
    console.log("New movie succesfully added to Firebase 🔥");
    updateMoviesGrid();
  }
}

function createMovieClicked(event) {
  event.preventDefault();
  const form = event.target;
  const title = form.title.value;
  const body = form.body.value;
  const image = form.image.value;

  createMovie(title, body, image);
  form.reset();
  document.querySelector("#dialog-create-movie").close();
}

function dialogClose() {
  document.querySelector("#dialog-movie").close();
  document.querySelector("#dialog-delete-movie").close();
  document.querySelector("#dialog-update-movie").close();
}

function deleteMovieClicked(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.getAttribute("data-id");
  console.log("Delete  clicked!", id);
  deleteMovie(id);
  form.reset();
  document.querySelector("#dialog-delete-movie").close();
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
  const value = event.target.value;
  const moviesToShow = searchMovies(value);
  showMovie(moviesToShow);
}

function searchMovies(searchValue) {
  searchValue = searchValue.toLowerCase();

  const results = movies.filter(checkTitle);

  function checkTitle(movie) {
    const title = movie.title.toLowerCase();
    return title.includes(searchValue);
  }

  return results;}
}

// function parseJSONString(jsonString) {
//   const parsed = JSON.parse(jsonString);
//   console.log(parsed);
// }
