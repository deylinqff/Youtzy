// pages/api/search.js

import { GetListByKeyword } from "youtube-search-api";

export default async function handler(req, res) {
  const query = req.query.q || "";
  const pagesToFetch = 25; // Cambiar a 5 para obtener más resultados

  try {
    let seen = new Set();
    let videos = [];

    for (let page = 1; page <= pagesToFetch; page++) {
      const data = await GetListByKeyword(query, false, page);
      const current = data.items.filter(item => item.type === "video");

      for (const video of current) {
        if (!seen.has(video.id)) {
          seen.add(video.id);
          videos.push(video);
        }
      }
    }

    // Ajustar el número de resultados para que tenga más videos si es necesario
    const resultado = videos.slice(0, 50).map(video => ({  // Limitar a 50 resultados
      titulo: video.title,
      miniatura: video.thumbnail?.thumbnails?.pop()?.url || '',
      canal: video.channelTitle || 'Desconocido',
      publicado: video.publishedTime || 'No disponible',
      vistas: parseInt(video.viewCount) || 0,
      likes: 'No disponible',
      duracion: video.length?.simpleText || 'No disponible',
      url: `https://youtube.com/watch?v=${video.id}`
    }));

    res.status(200).json({
      status: true,
      creator: "TuNombre",
      resultado
    });

  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ status: false, error: "Error al obtener resultados" });
  }
}