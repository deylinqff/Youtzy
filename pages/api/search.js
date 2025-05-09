const express = require('express');
const ytSearch = require('yt-search');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
  const q = req.query.q || 'lofi';
  try {
    const r = await ytSearch(q);
    const unique = new Set();
    const results = [];

    for (const v of r.videos) {
      if (!unique.has(v.videoId)) {
        unique.add(v.videoId);
        results.push({
          titulo: v.title,
          url: v.url,
          canal: v.author.name,
          vistas: v.views,
          duracion: v.timestamp,
          miniatura: v.thumbnail
        });
      }
      if (results.length >= 50) break;
    }

    res.json({ status: true, resultado: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, error: 'Error al buscar' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));