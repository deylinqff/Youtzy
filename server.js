const express = require('express');
const multer = require('multer');
const unzipper = require('unzipper');
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const SITES_DIR = path.join(__dirname, 'sites');

if (!fs.existsSync(SITES_DIR)) fs.mkdirSync(SITES_DIR);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use('/sites', express.static(SITES_DIR));

// HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Configuración para subir ZIP
const storage = multer({ dest: 'uploads/' });
app.post('/upload', storage.single('siteZip'), async (req, res) => {
  const siteName = `site_${Date.now()}`;
  const sitePath = path.join(SITES_DIR, siteName);
  fs.mkdirSync(sitePath);

  fs.createReadStream(req.file.path)
    .pipe(unzipper.Extract({ path: sitePath }))
    .on('close', () => {
      fs.unlinkSync(req.file.path);
      res.send(`Tu sitio está disponible en: <a href="/sites/${siteName}">/sites/${siteName}</a>`);
    });
});

// Clonar repositorio GitHub
app.post('/github', async (req, res) => {
  const { repoUrl } = req.body;
  const siteName = `site_${Date.now()}`;
  const sitePath = path.join(SITES_DIR, siteName);

  try {
    await simpleGit().clone(repoUrl, sitePath);
    res.send(`Tu sitio está disponible en: <a href="/sites/${siteName}">/sites/${siteName}</a>`);
  } catch (err) {
    res.status(500).send('Error al clonar el repositorio. Asegúrate que sea público.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});