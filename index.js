const express = require('express');
const ytSearch = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
  const query = req.query.q || 'lofi';

  try {
    const result = await ytSearch(query);
    const seen = new Set();
    const videos = [];

    for (const video of result.videos) {
      if (!seen.has(video.videoId)) {
        seen.add(video.videoId);
        videos.push({
          titulo: video.title,
          url: video.url,
          canal: video.author.name,
          vistas: video.views,
          duracion: video.timestamp,
          miniatura: video.thumbnail
        });
      }
      if (videos.length >= 50) break;
    }

    res.json({ status: true, resultado: videos });

  } catch (err) {
    console.error('Error al buscar:', err);
    res.status(500).json({ status: false, error: 'Error al buscar videos' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});