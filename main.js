"use strict";
window.addEventListener("load", initApp);
const endPoint = "https://movie-db-99347-default-rtdb.europe-west1.firebasedatabase.app/";

function initApp() {
  updatePostsGrid();
  // const postobject = parseJSONString('{"title": “This is my awesome title”, "image": “https://share.cederdorff.com/images/petl.jpg" }');
  // console.log(postobject);
  document.querySelector("#form-create-post").addEventListener("submit", createPostClicked);
  document.querySelector("#form-update-post").addEventListener("submit", updatePostClicked);
  document.querySelector("#form-delete-post").addEventListener("submit", deletePostClicked);
  document.querySelector("#btn-create-post").addEventListener("click", showCreatePostDialog);
}

async function updatePostsGrid() {
  const posts = await getPosts();
  showPosts(posts);
}

async function getPosts() {
  const response = await fetch(`${endPoint}/movies.json`);
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
    <p id="list-description">${postObject.plot}</p>
    <button id="btn-update">UPDATE</button>
        <button id="btn-delete">DELETE</button>

</article>
`
  );

  // document.querySelector(".grid article:last-child").addEventListener("click", postClicked);
  document.querySelector(".grid article:last-child img").addEventListener("click", postClicked);
  document.querySelector(".grid article:last-child #btn-delete").addEventListener("click", deleteClicked);
  document.querySelector(".grid article:last-child #btn-update").addEventListener("click", updateClicked);

  function postClicked() {
    document.querySelector("#dialog-title").textContent = `${postObject.title}`;
    document.querySelector("#dialog-id").textContent = `${postObject.id}`;
    document.querySelector("#dialog-img").src = `${postObject.posterUrl}`;

    document.querySelector("#dialog-post").showModal();

    document.querySelector("#btn-close").addEventListener("click", dialogClose);
  }

  function deleteClicked() {
    document.querySelector("#dialog-delete-post-title").textContent = postObject.title;
    document.querySelector("#form-delete-post").setAttribute("data-id", postObject.id);
    document.querySelector("#dialog-delete-post").showModal();
  }

  function updateClicked() {
    const updateForm = document.querySelector("#form-update-post");
    updateForm.title.value = postObject.title;
    updateForm.body.value = postObject.body;
    updateForm.image.value = postObject.image;
    updateForm.setAttribute("data-id", postObject.id);
    document.querySelector("#dialog-update-post").showModal();
    // to do
  }
}

function updatePostClicked(event) {
  event.preventDefault();
  const form = event.target;
  const title = form.title.value;
  const body = form.body.value;
  const image = form.image.value;
  const id = form.getAttribute("data-id");
  console.log("Update Post clciked!", id);
  updatePost(id, title, body, image);
  document.querySelector("#dialog-update-post").close();
}

async function updatePost(id, title, body, image) {
  // create object with the updated post information
  const postToUpdate = { title, body, image };
  const json = JSON.stringify(postToUpdate);

  const response = await fetch(`${endPoint}/movies/${id}.json`, {
    method: "PUT",
    body: json,
  });

  // Check if response is ok - if the response is successful
  if (response.ok) {
    // Update the post grid to display all posts and the new post
    updatePostsGrid();
  }
}

function showCreatePostDialog() {
  document.querySelector("#dialog-create-post").showModal();
}

async function createPost(title, body, image) {
  const newPost = { title: title, body: body, image: image };
  const json = JSON.stringify(newPost);

  const response = await fetch(`${endPoint}/movies.json`, {
    method: "POST",
    body: json,
  });
  if (response.ok) {
    console.log("New post succesfully added to Firebase 🔥");
    updatePostsGrid();
  }
}

function createPostClicked(event) {
  event.preventDefault();
  const form = event.target;
  const title = form.title.value;
  const body = form.body.value;
  const image = form.image.value;

  createPost(title, body, image);
  form.reset();
  document.querySelector("#dialog-create-post").close();
}

function dialogClose() {
  document.querySelector("#dialog-post").close();
  document.querySelector("#dialog-delete-post").close();
}

function deletePostClicked(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.getAttribute("data-id");
  console.log("Delete Post clicked!", id);
  deletePost(id);
  form.reset();
  document.querySelector("#dialog-delete-post").close();
}

async function deletePost(id) {
  const response = await fetch(`${endPoint}/movies/${id}.json`, {
    method: "DELETE",
  });
  if (response.ok) {
    updatePostsGrid();
  }
}

// function parseJSONString(jsonString) {
//   const parsed = JSON.parse(jsonString);
//   console.log(parsed);
// }
