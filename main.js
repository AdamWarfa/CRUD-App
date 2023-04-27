"use strict";
window.addEventListener("load", initApp);
const endPoint = "https://raw.githubusercontent.com/erik-sytnyk/movies-list/master/db.json";

async function initApp() {
  const posts = await getPosts();
  showPosts(posts);
  // const postobject = parseJSONString('{"title": “This is my awesome title”, "image": “https://share.cederdorff.com/images/petl.jpg" }');
  // console.log(postobject);
}

async function getPosts() {
  const response = await fetch(`${endPoint}`);
  const data = await response.json();
  const posts = preparePostData(data);

  return posts;
}

function preparePostData(dataObject) {
  const postArray = [];
  for (const key in dataObject) {
    const post = dataObject[key];
    post.id = key;
    console.log(post);
    postArray.push(post);
  }
  console.log(postArray);
  return postArray;
}

function showPosts(listOfPosts) {
  document.querySelector(".grid").innerHTML = "";

  for (const post of listOfPosts) {
    showPost(post);
  }
}

function showPost(postObject) {
  document.querySelector(".grid").insertAdjacentHTML(
    "beforeend",
    /*html*/ `

<article class="list-entry">
<h2 id="list-id">${postObject.id}</h2>
    <img id="list-image" src = "${postObject.posterUrl}"/>
    <h2 id="list-name">${postObject.title}</h2>
    <p id="list-description">${postObject.director}</p>
</article>
`
  );

  document.querySelector(".grid article:last-child").addEventListener("click", postClicked);
  function postClicked() {
    document.querySelector("#dialog-title").textContent = `${postObject.title}`;
    document.querySelector("#dialog-id").textContent = `${postObject.id}`;
    document.querySelector("#dialog-img").src = `${postObject.image}`;

    document.querySelector("dialog").showModal();

    document.querySelector(".btn-close").addEventListener("click", dialogClose);
  }
}

function dialogClose() {
  document.querySelector("dialog").close();
}
// function parseJSONString(jsonString) {
//   const parsed = JSON.parse(jsonString);
//   console.log(parsed);
// }
