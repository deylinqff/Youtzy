const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const musicList = document.getElementById("music-list");
const loadingMessage = document.getElementById("loading-message");
const audioPlayer = document.getElementById("audio-player");

const audioApis = [
  (url) => `https://api.siputzx.my.id/api/d/ytmp3?url=${url}`,
  (url) => `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${url}`
];

const videoApis = [
  (url) => `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
  (url) => `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`,
  (url) => `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
  (url) => `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`
];

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  musicList.innerHTML = "";
  loadingMessage.style.display = "block";
  audioPlayer.style.display = "none";

  try {
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = `https://night-api-seven.vercel.app/api/search/youtube?q=${encodeURIComponent(query)}`;
    const searchResults = await fetch(proxyUrl + encodeURIComponent(apiUrl));
    const data = await searchResults.json();
    loadingMessage.style.display = "none";

    if (!data.status || !data.result || data.result.length === 0) {
      musicList.innerHTML = `<p>No se encontraron resultados.</p>`;
      return;
    }

    const normalizar = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const queryNorm = normalizar(query);

    const resultadosFiltrados = data.result
      .map(video => {
        const tituloNorm = normalizar(video.titulo);
        const canalNorm = normalizar(video.canal);

        let score = 0;
        if (tituloNorm.includes(queryNorm)) score += 2;
        if (canalNorm.includes(queryNorm)) score += 1;

        const keywords = queryNorm.split(/\s+/);
        for (let palabra of keywords) {
          if (tituloNorm.includes(palabra)) score += 1;
          if (canalNorm.includes(palabra)) score += 0.5;
        }

        return { video, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    if (resultadosFiltrados.length === 0) {
      musicList.innerHTML = `<p>No se encontraron resultados relevantes.</p>`;
      return;
    }

    const truncate = (text, maxLength = 30) =>
      text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

    resultadosFiltrados.forEach(({ video }) => {
      const card = document.createElement("div");
      card.className = "music-card";

      const image = document.createElement("img");
      image.src = video.miniatura;

      const info = document.createElement("div");
      info.className = "music-info";

      const title = document.createElement("div");
      title.className = "music-title";
      title.textContent = truncate(video.titulo);

      const artist = document.createElement("div");
      artist.className = "music-artist";
      artist.textContent = truncate(video.canal);

      const channel = document.createElement("div");

      image.style.cursor = "pointer";
image.onclick = async () => {
  loadingMessage.style.display = "block";
  for (let api of videoApis) {
    try {
      const res = await fetch(api(video.url));
      const json = await res.json();
      const videoUrl = json?.data?.dl || json?.result?.download?.url || json?.downloads?.url || json?.data?.download?.url;
      if (videoUrl) {
        loadingMessage.style.display = "none";
        window.open(videoUrl, "_blank");
        return;
      }
    } catch (e) {
      console.warn("API video (al hacer clic en la imagen) falló:", e.message);
    }
  }
  loadingMessage.style.display = "none";
  alert("No se pudo cargar el video.");
};

      info.appendChild(title);
      info.appendChild(artist);
      info.appendChild(channel);
      musicList.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    loadingMessage.style.display = "none";
    musicList.innerHTML = `<p>Ocurrió un error al buscar.</p>`;
  }
});