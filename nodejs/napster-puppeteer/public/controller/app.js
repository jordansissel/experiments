'use strict';

function search() {
    const query = document.getElementById("search").value;
    console.log("Searching for: " + query);

    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", (event) => {
        console.log(event)
        console.log(JSON.parse(xhr.responseText))
    })

    xhr.open("GET", "/search?query=" + query)
    xhr.send()
}