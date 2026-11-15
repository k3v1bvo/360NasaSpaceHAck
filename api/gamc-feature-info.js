export default async function handler(req, res) {
  // Configuración de encabezados CORS para peticiones desde el navegador
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const queryParams = new URLSearchParams(req.query || {}).toString();
  const targetUrl = `https://recursosgamc.cochabamba.bo/proxy?${queryParams}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'NASA-Trend-Detective/1.0',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    if (contentType.includes('application/json') || rawText.trim().startsWith('{')) {
      try {
        const jsonData = JSON.parse(rawText);
        return res.status(200).json(jsonData);
      } catch {
        return res.status(200).json({ features: [], rawResponse: rawText });
      }
    }

    return res.status(200).json({ features: [], rawResponse: rawText });
  } catch (error) {
    return res.status(200).json({ 
      features: [], 
      error: 'Error consultando proxy GAMC GetFeatureInfo',
      details: error.message 
    });
  }
}
