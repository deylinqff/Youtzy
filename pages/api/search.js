import { GetListByKeyword } from "youtube-search-api";

export default async function handler(req, res) {
  const query = req.query.q || "";
  const pagesToFetch = 5; // Buscar en 5 páginas para evitar sobrecarga
  const maxResults = 50; // Máximo de 50 resultados

  try {
    if (!query.trim()) {
      return res.status(400).json({
        status: false,
        error: "El parámetro 'q' es obligatorio para realizar la búsqueda.",
      });
    }

    let seen = new Set(); // Para evitar duplicados
    let videos = [];

    // Realizar las búsquedas en paralelo para mejorar el rendimiento
    const fetchPromises = Array.from({ length: pagesToFetch }, (_, index) => {
      return GetListByKeyword(query, false, index + 1).catch(error => {
        console.warn(`Error al buscar en la página ${index + 1}:`, error);
        return null; // Continuar con las demás páginas en caso de error
      });
    });

    const results = await Promise.all(fetchPromises);

    // Procesar los resultados de las páginas
    for (const data of results) {
      if (!data || !data.items || data.items.length === 0) {
        continue; // Saltar páginas sin datos
      }

      const current = data.items.filter(item => item.type === "video");
      for (const video of current) {
        if (!seen.has(video.id)) {
          seen.add(video.id);
          videos.push(video);
        }
      }

      // Si alcanzamos el máximo de resultados, salimos del bucle
      if (videos.length >= maxResults) break;
    }

    // Preparar resultados para la respuesta
    const resultado = videos.slice(0, maxResults).map(video => ({
      titulo: video.title,
      miniatura: video.thumbnail?.thumbnails?.pop()?.url || '',
      canal: video.channelTitle || 'Desconocido',
      publicado: video.publishedTime || 'No disponible',
      vistas: parseInt(video.viewCount) || 0,
      likes: 'No disponible', // El dato no está disponible en la API
      duracion: video.length?.simpleText || 'No disponible',
      url: `https://youtube.com/watch?v=${video.id}`,
    }));

    if (resultado.length === 0) {
      return res.status(404).json({
        status: false,
        mensaje: "No se encontraron videos.",
      });
    }

    res.status(200).json({
      status: true,
      creator: "TuNombre",
      cantidad: resultado.length,
      resultado,
    });

  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({
      status: false,
      error: "Error al obtener resultados. Inténtalo más tarde.",
    });
  }
}