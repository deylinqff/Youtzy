import play from 'play-dl';

export default async function handler(req, res) {
  const query = req.query.q || "";

  try {
    const results = await play.search(query, { limit: 50 });

    const videos = results
      .filter(v => v.type === 'video')
      .map(video => ({
        titulo: video.title,
        miniatura: video.thumbnails?.[0]?.url || '',
        canal: video.channel.name,
        publicado: 'No disponible',
        duracion: video.durationRaw,
        vistas: video.views,
        url: video.url
      }));

    res.status(200).json({
      status: true,
      cantidad: videos.length,
      resultado: videos
    });

  } catch (error) {
    console.error("Error al buscar:", error);
    res.status(500).json({ status: false, error: "Error al buscar videos" });
  }
}