'use strict';

async function search() {
    const search = document.getElementById("search");
    const response = fetch("/search?" + new URLSearchParams(new FormData(search)).toString())
        .then(response => response.text())
        .catch(error => console.error("Response.text() failed", error))
        .then(text => {
            const doc = new DOMParser().parseFromString(text, 'text/html')
            document.getElementById("results").replaceChildren(doc.getRootNode().body)
        })
        // .then(text => document.getElementById("results").innerHTML = text)
        .catch(error => console.log("Error setting html", error))
}


async function play(id) {
    await fetch("/play/" + id)
}