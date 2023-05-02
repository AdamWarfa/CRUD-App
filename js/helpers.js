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

export { prepareMovieData };
