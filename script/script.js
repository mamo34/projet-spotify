fetch('./data/vestiges.json') // requête vers le fichier JSON
  .then(response => response.json()) // convertir la réponse textuelle en JSON
  .then(data => {
    // traiter les données
    console.log(data);
  });

  function setTrackList(data){
    // récupération du template
    let template = document.getElementById('trackCard');

    // parcourir les chansons
    for (let i = 0; i < data.length; i++) {
        // faire un clone tu template
        const clone = template.content.cloneNode(true);

        let artists= getDisplayArtists(data[i].artists);

        // remplir le clone
        clone.querySelector('.card-title').textContent = data[i].name;
        clone.querySelector('.card-text').textContent = artists;
        clone.querySelector('.card-img-top').src = data[i].album.images[0].url;
        clone.querySelector('.card-img-top').alt = data[i].name;

        // ajouter le clone au DOM dans le conteneur
        document.getElementById('trackList').appendChild(clone);
    }
}