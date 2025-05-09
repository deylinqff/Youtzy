import ytSearch from 'yt-search';

export default async function handler(req, res) {
  const query = req.query.q || "";

  try {
    const searchResult = await ytSearch(query);

    // Evitar duplicados con un Set
    const seen = new Set();
    const videosFiltrados = [];

    for (const video of searchResult.videos) {
      if (!seen.has(video.videoId)) {
        seen.add(video.videoId);
        videosFiltrados.push({
          titulo: video.title,
          miniatura: video.thumbnail,
          canal: video.author.name,
          publicado: video.ago,
          duracion: video.timestamp,
          vistas: video.views,
          url: video.url
        });
      }

      // Rompe si ya tienes 50 resultados únicos
      if (videosFiltrados.length >= 50) break;
    }

    res.status(200).json({
      status: true,
      cantidad: videosFiltrados.length,
      resultado: videosFiltrados
    });

  } catch (error) {
    console.error("Error al buscar videos:", error);
    res.status(500).json({ status: false, error: "Error al buscar videos" });
  }
}