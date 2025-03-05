particlesJS("particles-js", {
    "particles": {
        "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": "#ffffff" },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.3, "random": false },
        "size": { "value": 3, "random": true },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.1,
            "width": 1
        },
        "move": { "enable": true, "speed": 2 }
    },
    "interactivity": {
        "events": {
            "onhover": { "enable": true, "mode": "grab" },
            "onclick": { "enable": true, "mode": "push" }
        }
    },
    "retina_detect": true
});

AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
gsap.from(".hero h1", { duration: 1, y: -50, opacity: 0, ease: "power2.out" });
gsap.from(".hero p", { duration: 1, y: 50, opacity: 0, ease: "power2.out", delay: 0.5 });

new Typed('#mainTitle', {
    strings: ['Chess.com Profile Explorer'],
    typeSpeed: 80,
    showCursor: false
});
new Typed('#subtitle', {
    strings: ['fetch the data!', 'show your stats!', 'reveal everything!'],
    typeSpeed: 60,
    backSpeed: 40,
    loop: true
});

const profileCard = document.getElementById('profileCard');
const statsCard = document.getElementById('statsCard');
const clubsCard = document.getElementById('clubsCard');
const tournamentsCard = document.getElementById('tournamentsCard');

function showLoading(card) {
    card.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
    card.classList.remove('visible');
}

function revealCard(card) {
    setTimeout(() => {
        card.classList.add('visible');
    }, 100);
}

const toggleBtn = document.getElementById('toggleDarkMode');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

const ratingIcons = {
    chess_bullet: '<i class="fas fa-bolt rating-icon"></i>',
    chess_blitz: '<i class="fas fa-fire rating-icon"></i>',
    chess_rapid: '<i class="fas fa-tachometer-alt rating-icon"></i>',
    chess_daily: '<i class="fas fa-calendar-alt rating-icon"></i>',
    puzzles: '<i class="fas fa-puzzle-piece rating-icon"></i>',
    puzzle_rush: '<i class="fas fa-hourglass-half rating-icon"></i>'
};

document.getElementById('fetchBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    if (!username) return;
    [profileCard, statsCard, clubsCard, tournamentsCard].forEach(showLoading);
    try {
        const userRes = await fetch(`https://api.chess.com/pub/player/${username}`);
        if (!userRes.ok) throw new Error('User not found or API error');
        const userData = await userRes.json();
        const statsRes = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
        const statsData = statsRes.ok ? await statsRes.json() : null;
        const clubsRes = await fetch(`https://api.chess.com/pub/player/${username}/clubs`);
        let clubsArray = [];
        if (clubsRes.ok) {
            const clubsObj = await clubsRes.json();
            clubsArray = clubsObj.clubs || [];
        }
        const tournamentsRes = await fetch(`https://api.chess.com/pub/player/${username}/tournaments`);
        let tournamentsObj = null;
        if (tournamentsRes.ok) {
            tournamentsObj = await tournamentsRes.json();
        }
        const lastOnline = new Date(userData.last_online * 1000).toLocaleString();
        const joinedDate = new Date(userData.joined * 1000).toLocaleString();
        const userAvatar = userData.avatar || 'https://via.placeholder.com/120';
        const userName = userData.name || 'No Name Provided';
        const userCountry = userData.country ? userData.country.split('/').pop() : 'N/A';
        const userLocation = userData.location || 'N/A';
        const userTitle = userData.title ? userData.title.toUpperCase() : null;
        const streamer = userData.is_streamer ? 'Yes' : 'No';
        const verified = userData.verified ? 'Yes' : 'No';
        const followers = userData.followers || 0;

        profileCard.innerHTML = `
          <h2>Profile</h2>
          <div class="profile-header">
            <img src="${userAvatar}" alt="${userData.username}" class="profile-avatar" />
            <div class="profile-info">
              <div class="profile-item">
                <strong>Username:</strong> ${userData.username}
                ${userTitle ? `<span class="title-badge">${userTitle}</span>` : ''}
              </div>
              <div class="profile-item"><strong>Name:</strong> ${userName}</div>
              <div class="profile-item"><strong>Followers:</strong> ${followers}</div>
              <div class="profile-item"><strong>Verified:</strong> ${verified}</div>
              <div class="profile-item"><strong>Streamer:</strong> ${streamer}</div>
            </div>
          </div>
          <hr/>
          <div class="profile-item" id="countryRow">
            <strong>Country:</strong>
          </div>
          <div class="profile-item"><strong>Location:</strong> ${userLocation}</div>
          <div class="profile-item"><strong>Joined:</strong> ${joinedDate}</div>
          <div class="profile-item"><strong>Last Online:</strong> ${lastOnline}</div>
          <div class="profile-item"><strong>Status:</strong> ${userData.status || 'N/A'}</div>
        `;
        const countryRow = document.getElementById('countryRow');
        if (userCountry !== 'N/A') {
            const flagIconHTML = `<ph-flag-fill size="16" weight="fill" style="margin-right:6px; color: #58a6ff;"></ph-flag-fill>`;
            countryRow.innerHTML += ` ${flagIconHTML} ${userCountry}`;
        } else {
            countryRow.innerHTML += ' N/A';
        }
        revealCard(profileCard);

        statsCard.innerHTML = `<h2>Stats</h2>`;
        if (!statsData) {
            statsCard.innerHTML += `<p>No stats available.</p>`;
        } else {
            const categories = {
                chess_bullet: 'Bullet',
                chess_blitz: 'Blitz',
                chess_rapid: 'Rapid',
                chess_daily: 'Daily',
                puzzles: 'Puzzles',
                puzzle_rush: 'Puzzle Rush'
            };
            for (const [key, label] of Object.entries(categories)) {
                if (statsData[key]) {
                    const ratingObj = statsData[key];
                    let ratingStr = '';
                    if (key === 'puzzle_rush' && ratingObj.best) {
                        ratingStr = `Best Score: ${ratingObj.best.score}`;
                    } else if (ratingObj.last && ratingObj.last.rating) {
                        ratingStr = `Rating: ${ratingObj.last.rating}` +
                            (ratingObj.best ? ` (Best: ${ratingObj.best.rating})` : '');
                    } else {
                        ratingStr = `No rating data available.`;
                    }
                    statsCard.innerHTML += `
                <div class="profile-item">
                  ${ratingIcons[key] || ''}
                  <strong>${label}:</strong> ${ratingStr}
                </div>
              `;
                }
            }
        }
        revealCard(statsCard);

        clubsCard.innerHTML = `<h2>Clubs</h2>`;
        if (!clubsArray.length) {
            clubsCard.innerHTML += `<p>No clubs found.</p>`;
        } else {
            clubsArray.forEach(club => {
                clubsCard.innerHTML += `
              <div class="list-item">
                <a href="${club.url}" target="_blank">${club.name || 'N/A'}</a>
              </div>
            `;
            });
        }
        revealCard(clubsCard);

        tournamentsCard.innerHTML = `<h2>Tournaments</h2>`;
        if (!tournamentsObj) {
            tournamentsCard.innerHTML += `<p>No tournament data found.</p>`;
        } else {
            const finished = tournamentsObj.finished || [];
            const inProgress = tournamentsObj.in_progress || [];
            const registered = tournamentsObj.registered || [];

            function buildTournamentTable(tList) {
                if (!tList.length) {
                    return `<p style="margin-top:5px;">No tournaments here.</p>`;
                }
                let rows = '';
                tList.forEach(t => {
                    const name = t.name || 'N/A';
                    const url = t.url || '#';
                    const timeClass = t.time_class || 'standard';
                    const type = t.type || 'N/A';
                    const status = t.status || 'N/A';
                    const wins = t.wins ?? 0;
                    const losses = t.losses ?? 0;
                    const draws = t.draws ?? 0;
                    const points = t.points_awarded ?? 'N/A';
                    const place = t.placement ?? 'N/A';
                    const total = t.total_players ?? 'N/A';
                    let statusClass = '';
                    if (status === 'eliminated')
                        statusClass = 'status-eliminated';
                    else if (status === 'withdrew')
                        statusClass = 'status-withdrew';
                    else if (status === 'registered')
                        statusClass = 'status-registered';
                    else if (status === 'finished' || status === 'complete')
                        statusClass = 'status-complete';
                    rows += `
                <tr class="tournament-row">
                  <td><a href="${url}" target="_blank">${name}</a></td>
                  <td>${timeClass}</td>
                  <td>${type}</td>
                  <td><span class="status-badge ${statusClass}">${status}</span></td>
                  <td>${wins}-${losses}-${draws}</td>
                  <td>${points}</td>
                  <td>${place}/${total}</td>
                </tr>
              `;
                });
                return `
              <table class="tournament-table collapse-content">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Time Class</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>W-L-D</th>
                    <th>Points</th>
                    <th>Placement</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            `;
            }

            const finishedHTML = buildTournamentTable(finished);
            const inProgressHTML = buildTournamentTable(inProgress);
            const registeredHTML = buildTournamentTable(registered);

            tournamentsCard.innerHTML += `
            <div class="tournament-section">
              <h3 data-toggle="finishedToggle">Finished Tournaments
                <i class="fas fa-chevron-down toggle-icon"></i>
              </h3>
              ${finishedHTML}
            </div>
            <div class="tournament-section">
              <h3 data-toggle="inProgressToggle">In-Progress Tournaments
                <i class="fas fa-chevron-down toggle-icon"></i>
              </h3>
              ${inProgressHTML}
            </div>
            <div class="tournament-section">
              <h3 data-toggle="registeredToggle">Registered Tournaments
                <i class="fas fa-chevron-down toggle-icon"></i>
              </h3>
              ${registeredHTML}
            </div>
          `;

            document.querySelectorAll('.tournament-section h3').forEach(header => {
                header.addEventListener('click', () => {
                    const table = header.parentElement.querySelector('.collapse-content');
                    const icon = header.querySelector('.toggle-icon');
                    table.classList.toggle('open');
                    icon.style.transform = table.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0)';
                });
            });
        }
        revealCard(tournamentsCard);
    } catch (err) {
        profileCard.innerHTML = `<p>Error: ${err.message}</p>`;
        statsCard.innerHTML = `<p>Error: ${err.message}</p>`;
        clubsCard.innerHTML = `<p>Error: ${err.message}</p>`;
        tournamentsCard.innerHTML = `<p>Error: ${err.message}</p>`;
    }
});
