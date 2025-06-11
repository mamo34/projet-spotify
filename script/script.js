fetch('../data/data.json')
          .then(response => response.json())
          .then(data => {
              const artistNames = data.flatMap(entry => entry.artists.map(artist => artist.name));

              const topArtists = artistNames.reduce((acc, name) => {
                  acc[name] = (acc[name] || 0) + 1;
                  return acc;
              }, {});

              const sortedArtists = Object.entries(topArtists).sort((a, b) => b[1] - a[1]).slice(0, 10);

              const topArtistsData = {
                  labels: sortedArtists.map(artist => artist[0]),
                  datasets: [{
                      label: 'Nombre de mentions',
                      data: sortedArtists.map(artist => artist[1]),
                      backgroundColor: 'rgba(54, 162, 235, 0.5)',
                      borderColor: 'rgba(54, 162, 235, 1)',
                      borderWidth: 1
                  }]
              };

              const topArtistsConfig = {
                  type: 'bar',
                  data: topArtistsData,
                  options: {
                      indexAxis: 'y', 
                      responsive: true,
                      scales: {
                          x: {
                              beginAtZero: true
                          },
                          y: {
                              beginAtZero: true
                          }
                      }
                  }
              };

              const topArtistsCtx = document.getElementById('topArtistsChart').getContext('2d');
              new Chart(topArtistsCtx, topArtistsConfig);
          })
          .catch(error => console.error('Error loading the JSON data:', error));

fetch('../data/data.json')
  .then(response => response.json())
  .then(data => {
    const genres = data.flatMap(entry =>
      entry.artists.flatMap(artist => artist.genres || [])
    );

    const genreCounts = genres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const topGenres = sortedGenres.slice(0, 7);
    const otherCount = sortedGenres.slice(7).reduce((sum, [, count]) => sum + count, 0);

    const genreLabels = [...topGenres.map(genre => genre[0]), 'Autres'];
    const genreData = [...topGenres.map(genre => genre[1]), otherCount];

    const genreDistributionData = {
      labels: genreLabels,
      datasets: [{
        label: 'Distribution des genres',
        data: genreData,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#E7E9ED', '#C9CBCF'
        ],
        hoverOffset: 4
      }]
    };

    const genreDistributionConfig = {
      type: 'pie',
      data: genreDistributionData,
      options: {
        responsive: true
      }
    };

    const genreDistributionCtx = document.getElementById('genreDistributionChart').getContext('2d');
    new Chart(genreDistributionCtx, genreDistributionConfig);
  })
  .catch(error => console.error('Error loading the JSON data for genres:', error));






  fetch('../data/data.json')
  .then(response => response.json())
  .then(data => {
    populateSongsTable(data);
    setupSearch();
    setupSorting();
    setupModalListener(data);
    generatePopularAlbums(data);
  })
  .catch(error => console.error('Erreur lors du chargement des données :', error));



function populateSongsTable(tracks) {
  var tbody = document.getElementById('songsTableBody');
  tbody.innerHTML = '';

  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    
    var row = document.createElement('tr');
    
    var nameCell = document.createElement('td');
    nameCell.textContent = track.name;
    nameCell.setAttribute('data-label', 'Titre');
    row.appendChild(nameCell);
    
    var artistCell = document.createElement('td');
    var artistNames = []; 
    for (var j = 0; j < track.artists.length; j++) {
      artistNames.push(track.artists[j].name);
    }
    artistCell.textContent = artistNames.join(', ');
    artistCell.setAttribute('data-label', 'Artiste');
    row.appendChild(artistCell);
    
    var albumCell = document.createElement('td');
    albumCell.textContent = track.album ? track.album.name : '';
    albumCell.setAttribute('data-label', 'Album');
    row.appendChild(albumCell);
    
    var actionCell = document.createElement('td');
    actionCell.className = 'text-center';
    actionCell.setAttribute('data-label', 'Action'); 
    
    var detailButton = document.createElement('button');
    detailButton.className = 'btn btn-sm btn-outline-primary details-btn';
    detailButton.setAttribute('data-bs-toggle', 'modal');
    detailButton.setAttribute('data-bs-target', '#songDetailModal');
    detailButton.setAttribute('data-song-id', track.id);
    
    var icon = document.createElement('i');
    icon.className = 'bi bi-info-circle';
    detailButton.appendChild(icon);
    
    var buttonText = document.createTextNode(' Détails');
    detailButton.appendChild(buttonText);
    actionCell.appendChild(detailButton);
    row.appendChild(actionCell);
    
    tbody.appendChild(row);
  }
}

function setupModalListener(tracks) {
  var songDetailModal = document.getElementById('songDetailModal');
  
  songDetailModal.addEventListener('show.bs.modal', function (event) {
    var button = event.relatedTarget;
    var songId = button.getAttribute('data-song-id');
    
    var track = null;
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].id === songId) {
        track = tracks[i];
        break;
      }
    }
    
    if (track) {
      document.getElementById('modalSongTitle').textContent = track.name;
      document.getElementById('modalSongDuration').textContent = formatDuration(track.duration_ms);
      document.getElementById('modalSongPopularity').textContent = track.popularity || 0;
      document.getElementById('modalTrackNumber').textContent = track.track_number || 1;
      document.getElementById('modalExplicit').textContent = track.explicit ? 'Oui' : 'Non';
      
      if (track.album) {
        var albumImage = '';
        if (track.album.images && track.album.images.length > 0) {
          albumImage = track.album.images[0].url;
        }
        var albumImageElement = document.getElementById('modalAlbumImage');
        albumImageElement.src = albumImage;
        albumImageElement.alt = track.album.name + '-cover';
        document.getElementById('modalReleaseDate').textContent = formatDate(track.album.release_date);
        document.getElementById('modalAlbumPopularity').textContent = 'Popularité: ' + (track.album.popularity || 0) + '/100';
      }
      
      var audioElement = document.getElementById('modalAudioPreview');
      if (track.preview_url) {
        audioElement.src = track.preview_url;
        audioElement.style.display = 'block';
      } else {
        audioElement.style.display = 'none';
      }
      
      var artistsListElement = document.getElementById('modalArtistsList');
      artistsListElement.innerHTML = '<strong>Artistes :</strong>';
      
      var artistsList = document.createElement('ul');
      artistsList.className = 'list-unstyled mt-1';
      
      for (var j = 0; j < track.artists.length; j++) {
        var artist = track.artists[j];
        
        var artistItem = document.createElement('li');
        artistItem.className = 'd-flex align-items-center mb-2';
        
        var artistImageUrl = 'https://via.placeholder.com/30';
        if (artist.images && artist.images.length > 0) {
          artistImageUrl = artist.images[0].url;
        }
        
        var artistImg = document.createElement('img');
        artistImg.src = artistImageUrl;
        artistImg.className = 'rounded-circle me-2';
        artistImg.width = 30;
        artistImg.height = 30;
        artistImg.onerror = function() { 
          this.src = 'https://via.placeholder.com/30'; 
        };
        artistItem.appendChild(artistImg);
        
        var artistInfo = document.createElement('div');
        
        var artistName = document.createElement('div');
        artistName.textContent = artist.name;
        artistInfo.appendChild(artistName);
        
        var artistStats = document.createElement('small');
        artistStats.className = 'text-muted';
        artistStats.textContent = 'Popularité: ' + (artist.popularity || 0) + '/100';
        
        if (artist.followers && artist.followers.total) {
          artistStats.textContent += ' • ' + artist.followers.total + ' followers';
        }
        
        artistInfo.appendChild(artistStats);
        artistItem.appendChild(artistInfo);
        
        artistsList.appendChild(artistItem);
      }
      
      artistsListElement.appendChild(artistsList);
      
      var genresElement = document.getElementById('modalGenres');
      genresElement.innerHTML = '';
      
      var genres = [];
      if (track.album && track.album.genres) {
        genres = track.album.genres;
      }
      
      if (genres.length > 0) {
        for (var k = 0; k < genres.length; k++) {
          var genre = genres[k];
          
          var badge = document.createElement('span');
          badge.className = 'badge bg-secondary me-1 mb-1';
          badge.textContent = genre;
          genresElement.appendChild(badge);
        }
      } else {
        genresElement.textContent = 'Aucun genre disponible';
      }
      
      var spotifyLink = document.getElementById('modalSpotifyLink');
      if (track.external_urls && track.external_urls.spotify) {
        spotifyLink.href = track.external_urls.spotify;
        spotifyLink.style.display = 'inline-block';
      } else {
        spotifyLink.style.display = 'none';
      }
    }
  });
}

function generatePopularAlbums(tracks) {
  var albums = {};
  
  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    
    if (track.album && track.album.id) {
      if (!albums[track.album.id]) {
        albums[track.album.id] = {
          id: track.album.id,
          name: track.album.name,
          images: track.album.images,
          release_date: track.album.release_date,
          popularity: track.album.popularity || 0,
          trackCount: 0,
          artistNames: []
        };
      }
      
      albums[track.album.id].trackCount++;
      
      for (var j = 0; j < track.artists.length; j++) {
        var artistName = track.artists[j].name;
        if (!albums[track.album.id].artistNames.includes(artistName)) {
          albums[track.album.id].artistNames.push(artistName);
        }
      }
    }
  }
  
  var albumsList = [];
  for (var id in albums) {
    albumsList.push(albums[id]);
  }
  
  albumsList.sort(function(a, b) {
    return b.popularity - a.popularity;
  });
  
  var topAlbums = albumsList.slice(0, 12);
  
  var container = document.getElementById('popularAlbums');
  container.innerHTML = '';
  
  for (var i = 0; i < topAlbums.length; i++) {
    var album = topAlbums[i];
    
    var col = document.createElement('div');
    col.className = 'col';
    
    var card = document.createElement('div');
    card.className = 'card h-100 shadow-sm';
    
    var img = document.createElement('img');
    img.className = 'card-img-top';
    img.style.height = '200px';
    img.style.objectFit = 'cover';
    
    if (album.images && album.images.length > 0) {
      img.src = album.images[0].url;
    } else {
      img.src = 'https://via.placeholder.com/300';
    }
    img.alt = album.name + '-cover';
    card.appendChild(img);
    
    var cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    var title = document.createElement('h5');
    title.className = 'card-title text-truncate';
    title.textContent = album.name;
    cardBody.appendChild(title);
    
    var artist = document.createElement('p');
    artist.className = 'card-text text-truncate';
    artist.textContent = album.artistNames[0] || '';
    cardBody.appendChild(artist);
    
    var dateP = document.createElement('p');
    dateP.className = 'card-text';
    var dateSmall = document.createElement('small');
    dateSmall.className = 'text-muted';
    
    if (album.release_date) {
      var date = new Date(album.release_date);
      var day = date.getDate();
      var month = date.toLocaleString('fr-FR', { month: 'long' });
      var year = date.getFullYear();
      dateSmall.textContent = day + ' ' + month + ' ' + year;
    }
    
    dateP.appendChild(dateSmall);
    cardBody.appendChild(dateP);
    
    var badges = document.createElement('div');
    badges.className = 'd-flex justify-content-between align-items-center';
    
    var trackBadge = document.createElement('span');
    trackBadge.className = 'badge bg-primary';
    trackBadge.textContent = album.trackCount + ' titres';
    badges.appendChild(trackBadge);
    
    var popBadge = document.createElement('span');
    popBadge.className = 'badge bg-success';
    popBadge.textContent = album.popularity + '/100';
    badges.appendChild(popBadge);
    
    cardBody.appendChild(badges);
    card.appendChild(cardBody);
    col.appendChild(card);
    
    container.appendChild(col);
  }
}

function formatDuration(ms) {
  if (!ms) return '0:00';
  
  var minutes = Math.floor(ms / 60000);
  var seconds = Math.floor((ms % 60000) / 1000);
  
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  
  return minutes + ':' + seconds;
}

function formatDate(dateString) {
  if (!dateString) return '';
  
  var date = new Date(dateString);
  
  var day = date.getDate();
  var month = date.toLocaleString('fr-FR', { month: 'long' });
  var year = date.getFullYear();
  
  return day + ' ' + month + ' ' + year;
}

function setupSearch() {
  var searchInput = document.getElementById('searchInput');
  
  searchInput.addEventListener('input', function () {
    var term = this.value.toLowerCase();
    var rows = document.querySelectorAll('#songsTableBody tr');
    
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var cells = row.cells;
      
      var title = cells[0].textContent.toLowerCase();
      var artist = cells[1].textContent.toLowerCase();
      var album = cells[2].textContent.toLowerCase();
      
      if (title.includes(term) || artist.includes(term) || album.includes(term)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  });
}

function setupSorting() {
  var headers = document.querySelectorAll('.sortable');
  
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    header.style.cursor = 'pointer';
    
    header.addEventListener('click', function () {
      var sortKey = this.dataset.sort;
      var colIndex = 0;
      
      var headerParent = this.parentNode;
      for (var j = 0; j < headerParent.children.length; j++) {
        if (headerParent.children[j] === this) {
          colIndex = j;
          break;
        }
      }
      
      var direction = 'asc';
      if (this.dataset.sortDir === 'asc') {
        direction = 'desc';
      }
      this.dataset.sortDir = direction;
      
      var tbody = document.getElementById('songsTableBody');
      var rows = [];
      for (var k = 0; k < tbody.rows.length; k++) {
        rows.push(tbody.rows[k]);
      }
      
      rows.sort(function(a, b) {
        var cellA = a.cells[colIndex].textContent.toLowerCase();
        var cellB = b.cells[colIndex].textContent.toLowerCase();
        
        if (direction === 'asc') {
          return cellA.localeCompare(cellB);
        } else {
          return cellB.localeCompare(cellA);
        }
      });
      
      for (var l = 0; l < rows.length; l++) {
        tbody.appendChild(rows[l]);
      }
      
      for (var m = 0; m < headers.length; m++) {
        var el = headers[m];
        el.classList.remove('text-primary');
        
        var icon = el.querySelector('i');
        if (icon) {
          icon.remove();
        }
      }
      
      this.classList.add('text-primary');
      
      var icon = document.createElement('i');
      if (direction === 'asc') {
        icon.className = 'bi bi-sort-alpha-down ms-1';
      } else {
        icon.className = 'bi bi-sort-alpha-up ms-1';
      }
      this.appendChild(icon);
    });
  }
}



const overlay = document.getElementById('overlayImageWrapper');

overlay.addEventListener('mouseenter', () => {
  // Clear previous sparkles if any (optional)
  document.querySelectorAll('.sparkle, .sparkle-emoji').forEach(el => el.remove());

  // Number of dot sparkles
  const dotCount = 12;
  // Number of emoji sparkles
  const emojiCount = 6;
  const sparkleEmoji = '✨';

  // Create dot sparkles
  for (let i = 0; i < dotCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');

    // Wider random spread: from -80px to +80px horizontally and vertically
    const x = (Math.random() - 0.5) * 160 + 'px';
    const y = (Math.random() - 0.5) * 160 + 'px';

    sparkle.style.setProperty('--x', x);
    sparkle.style.setProperty('--y', y);

    // Random size between 4 and 8px
    const size = 4 + Math.random() * 4;
    sparkle.style.width = sparkle.style.height = size + 'px';

    overlay.appendChild(sparkle);

    sparkle.addEventListener('animationend', () => sparkle.remove());
  }

  // Create emoji sparkles
  for (let i = 0; i < emojiCount; i++) {
    const emoji = document.createElement('div');
    emoji.classList.add('sparkle-emoji');
    emoji.textContent = sparkleEmoji;

    // Same wider spread
    const x = (Math.random() - 0.5) * 160 + 'px';
    const y = (Math.random() - 0.5) * 160 + 'px';

    emoji.style.setProperty('--x', x);
    emoji.style.setProperty('--y', y);

    // Random font size 14-22px for variety
    emoji.style.fontSize = (14 + Math.random() * 8) + 'px';

    overlay.appendChild(emoji);

    emoji.addEventListener('animationend', () => emoji.remove());
  }


   document.querySelectorAll('.sparkle, .sparkle-emoji').forEach(el => el.remove());


  for (let i = 0; i < dotCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    const x = (Math.random() - 0.5) * 160 + 'px';
    const y = (Math.random() - 0.5) * 160 + 'px';
    sparkle.style.setProperty('--x', x);
    sparkle.style.setProperty('--y', y);
    const size = 4 + Math.random() * 4;
    sparkle.style.width = sparkle.style.height = size + 'px';
    overlay.appendChild(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove());
  }

  for (let i = 0; i < emojiCount; i++) {
    const emoji = document.createElement('div');
    emoji.classList.add('sparkle-emoji');
    emoji.textContent = sparkleEmoji;
    const x = (Math.random() - 0.5) * 160 + 'px';
    const y = (Math.random() - 0.5) * 160 + 'px';
    emoji.style.setProperty('--x', x);
    emoji.style.setProperty('--y', y);
    emoji.style.fontSize = (14 + Math.random() * 8) + 'px';
    overlay.appendChild(emoji);
    emoji.addEventListener('animationend', () => emoji.remove());
  }

  // 1/100 chance explosion
  if (Math.floor(Math.random() * 100) === 0) {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    overlay.appendChild(explosion);
    explosion.addEventListener('animationend', () => explosion.remove());
  }
});
