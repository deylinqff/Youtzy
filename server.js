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

app.use(express.urlencoded({ extended: true }));
app.use('/sites', express.static(SITES_DIR));

// Para recibir HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Cargar archivo ZIP
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('siteZip'), async (req, res) => {
  const siteId = `site_${Date.now()}`;
  const sitePath = path.join(SITES_DIR, siteId);
  fs.mkdirSync(sitePath);

  fs.createReadStream(req.file.path)
    .pipe(unzipper.Extract({ path: sitePath }))
    .on('close', () => {
      fs.unlinkSync(req.file.path); // eliminar ZIP temporal
      res.redirect(`/sites/${siteId}/`);
    })
    .on('error', (err) => {
      console.error('Error descomprimiendo:', err);
      res.status(500).send('Error descomprimiendo el archivo');
    });
});

// Clonar repo de GitHub
app.post('/github', async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const siteId = `site_${Date.now()}`;
  const sitePath = path.join(SITES_DIR, siteId);

  const git = simpleGit();
  try {
    await git.clone(repoUrl, sitePath);
    res.redirect(`/sites/${siteId}/`);
  } catch (err) {
    console.error('Error clonando:', err.message);
    res.status(500).send('Error al clonar el repositorio');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});