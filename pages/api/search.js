// pages/api/search.js

import { GetListByKeyword } from "youtube-search-api";

export default async function handler(req, res) {
  const query = req.query.q || "";
  const pagesToFetch = 5; // Buscar en 5 páginas

  try {
    let seen = new Set();
    let videos = [];

    for (let page = 1; page <= pagesToFetch; page++) {
      const data = await GetListByKeyword(query, false, page);

      if (!data.items || data.items.length === 0) {
        console.log(`Página ${page} sin resultados`);
        continue;
      }

      const current = data.items.filter(item => item.type === "video");
      console.log(`Página ${page}: ${current.length} videos encontrados`);

      for (const video of current) {
        if (!seen.has(video.id)) {
          seen.add(video.id);
          videos.push(video);
        }
      }
    }

    if (videos.length === 0) {
      return res.status(404).json({
        status: false,
        mensaje: "No se encontraron videos"
      });
    }

    const resultado = videos.slice(0, 50).map(video => ({
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
      cantidad: resultado.length,
      resultado
    });

  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ status: false, error: "Error al obtener resultados" });
  }
}