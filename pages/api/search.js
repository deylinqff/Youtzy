import play from 'play-dl';

export default async function handler(req, res) {
  const query = req.query.q || "";

  try {
    // Buscar directamente con límite
    const results = await play.search(query, { limit: 50 });

    // Filtrar y formatear resultados
    const videos = results
      .filter(v => v.type === 'video') // Filtrar solo videos
      .map(video => ({
        titulo: video.title,
        miniatura: video.thumbnails?.[0]?.url || '',
        canal: video.channel.name || 'Desconocido',
        publicado: 'No disponible', // El dato no está disponible en play-dl
        duracion: video.durationRaw,
        vistas: video.views || 0, // Manejar vistas como número
        url: video.url
      }));

    // Responder con resultados
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