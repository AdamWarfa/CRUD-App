import { prepareMovieData } from "./helpers.js";

// Firebase variabel
const endPoint = "https://movie-db-99347-default-rtdb.europe-west1.firebasedatabase.app/";

async function getMovies() {
  // Fetch JSON data fra vores database
  const response = await fetch(`${endPoint}/movies.json`);
  const data = await response.json();
  const movies = prepareMovieData(data);

  return movies;
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

  return response;
  //   // Tjekker hvis response er okay, hvis response er succesfuld ->
  //   if (response.ok) {
  //     // Opdater MoviesGrid til at displaye all film og den nye film
  //     updateMoviesGrid();
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

  return response;
}

async function deleteMovie(id) {
  const response = await fetch(`${endPoint}/movies/${id}.json`, {
    method: "DELETE",
  });

  return response;
}

export { getMovies, prepareMovieData, updateMovie, createMovie, deleteMovie };
