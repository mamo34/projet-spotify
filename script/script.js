fetch('./data/vestiges') // requête vers le fichier JSON
  .then(response => response.json()) // convertir la réponse textuelle en JSON
  .then(data => {
    // traiter les données
    console.log(data);
  });