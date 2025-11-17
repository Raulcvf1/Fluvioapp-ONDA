const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

    console.log('Conectado ao MongoDB Atlas');

    // Configurações do Express
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'view')));

// Adiciona caminhos dos arquivos CSV
const csvDir = path.join(__dirname, 'view', 'csv');
const conteudoCsvPath = path.join(csvDir, 'conteudo.csv');
const tipoCsvPath = path.join(csvDir, 'tipo.csv');

// Utilitário simples para garantir diretório CSV
if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
}

// Utilitário para leitura segura
function readFileSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return '';
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Erro ao ler arquivo:', filePath, err);
    return '';
  }
}

// GET tipos do tipo.csv (uma coluna "tipo")
app.get('/api/tipo', (req, res) => {
  const content = readFileSafe(tipoCsvPath);
  if (!content.trim()) {
    return res.json([]);
  }
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  let startIndex = 0;
  if (lines[0].toLowerCase().includes('tipo')) {
    startIndex = 1; // pula cabeçalho
  }
  const tipos = lines.slice(startIndex).map(l => l.split(';')[0].trim()).filter(Boolean);
  res.json(tipos);
});

// GET conteúdos do conteudo.csv (campos separados por ;) com cabeçalho: titulo;tipo;popular;cientifico;descricao
app.get('/api/conteudo', (req, res) => {
  const content = readFileSafe(conteudoCsvPath);
  if (!content.trim()) {
    return res.json([]);
  }
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  let startIndex = 0;
  let headers = ['titulo','tipo','popular','cientifico','descricao'];
  if (lines[0].toLowerCase().includes('titulo')) {
    headers = lines[0].split(';').map(h => h.trim());
    startIndex = 1;
  }
  const items = lines.slice(startIndex).map(l => {
    const parts = l.split(';');
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (parts[idx] || '').trim(); });
    return obj;
  });
  res.json(items);
});

// POST para adicionar um conteúdo ao conteudo.csv
app.post('/api/conteudo', (req, res) => {
  const { titulo, tipo, popular, cientifico, descricao } = req.body || {};
  if (!titulo || !tipo) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: titulo e tipo' });
  }
  // Normaliza valores e evita quebras de linha
  const sanitize = (v) => String(v ?? '').replace(/\r?\n/g, ' ').replace(/;/g, ',');
  const row = [sanitize(titulo), sanitize(tipo), sanitize(popular), sanitize(cientifico), sanitize(descricao)].join(';');

  try {
    const existing = readFileSafe(conteudoCsvPath);
    if (!existing.trim()) {
      const header = 'titulo;tipo;popular;cientifico;descricao\n';
      fs.writeFileSync(conteudoCsvPath, header + row + '\n', 'utf8');
    } else {
      fs.appendFileSync(conteudoCsvPath, row + '\n', 'utf8');
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Erro ao escrever conteudo.csv:', err);
    return res.status(500).json({ error: 'Falha ao salvar conteúdo' });
  }
});


    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`http://localhost:${PORT}/home.html`)
        console.log(`http://localhost:${PORT}/medidor.html`)
        console.log(`http://localhost:${PORT}/login.html`)
    });

