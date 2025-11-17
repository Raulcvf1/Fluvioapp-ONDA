window.onload = function () {
  carregarTiposConteudo();
  carregarConteudos();

  const btn = document.getElementById('btnConteudo');
  if (btn) {
    btn.addEventListener('click', async () => {
      const titulo = document.getElementById('txtNome')?.value?.trim() || '';
      const tipo = document.getElementById('dropTipo')?.value?.trim() || '';
      const popular = document.getElementById('txtPopular')?.value?.trim() || '';
      const cientifico = document.getElementById('txtCientifico')?.value?.trim() || '';
      const descricao = document.getElementById('txtDescricao')?.value?.trim() || '';

      if (!titulo || !tipo) {
        alert('Preencha pelo menos Título e Tipo do conteúdo.');
        return;
      }

      try {
        const resp = await fetch('/api/conteudo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, tipo, popular, cientifico, descricao })
        });
        const data = await resp.json();
        if (data && data.success) {
          // Limpa campos
          document.getElementById('txtNome').value = '';
          document.getElementById('dropTipo').value = '';
          document.getElementById('txtPopular').value = '';
          document.getElementById('txtCientifico').value = '';
          document.getElementById('txtDescricao').value = '';

          // Fecha modal
          const modalEl = document.getElementById('sensorModal');
          if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
          }

          // Recarrega conteúdos
          carregarConteudos();
        } else {
          alert('Falha ao cadastrar conteúdo.');
        }
      } catch (err) {
        console.error('Erro ao salvar conteúdo:', err);
        alert('Erro no servidor ao salvar conteúdo.');
      }
    });
  }

  // Eventos de filtro/ordenacao/busca
  const filtroTipo = document.getElementById('filtroTipo');
  const ordenarSelect = document.getElementById('ordenarSelect');
  const btnBuscar = document.getElementById('btnBuscar');
  const inputBusca = document.getElementById('conteudo');

  if (filtroTipo) filtroTipo.addEventListener('change', aplicarFiltros);
  if (ordenarSelect) ordenarSelect.addEventListener('change', aplicarFiltros);
  if (btnBuscar) btnBuscar.addEventListener('click', aplicarFiltros);
  if (inputBusca) inputBusca.addEventListener('keyup', (e) => { if (e.key === 'Enter') aplicarFiltros(); });
};

let cacheConteudos = [];

async function carregarConteudos() {
  try {
    const resp = await fetch('/api/conteudo');
    const itens = await resp.json();
    cacheConteudos = Array.isArray(itens) ? itens : [];
    aplicarFiltros();
  } catch (err) {
    console.error('Erro ao carregar conteúdos:', err);
    cacheConteudos = [];
    aplicarFiltros();
  }
}

function aplicarFiltros() {
  const filtroTipo = document.getElementById('filtroTipo');
  const ordenarSelect = document.getElementById('ordenarSelect');
  const inputBusca = document.getElementById('conteudo');

  const tipo = filtroTipo?.value || '';
  const termo = (inputBusca?.value || '').trim().toLowerCase();
  const ordenar = ordenarSelect?.value || 'recentes';

  let lista = [...cacheConteudos];

  // Filtra por tipo
  if (tipo) {
    lista = lista.filter(c => String(c.tipo || '').toLowerCase() === String(tipo).toLowerCase());
  }

  // Filtra por busca (titulo, descricao, popular, cientifico)
  if (termo) {
    lista = lista.filter(c => {
      const alvo = [c.titulo, c.descricao, c.popular, c.cientifico].map(v => String(v || '').toLowerCase()).join(' ');
      return alvo.includes(termo);
    });
  }

  // Ordenação
  lista.sort((a, b) => {
    const ta = String(a.titulo || '')
    const tb = String(b.titulo || '')
    const tia = String(a.tipo || '')
    const tib = String(b.tipo || '')

    switch (ordenar) {
      case 'titulo_az':
        return ta.localeCompare(tb, 'pt-BR', { sensitivity: 'base' });
      case 'titulo_za':
        return tb.localeCompare(ta, 'pt-BR', { sensitivity: 'base' });
      case 'tipo_az':
        return tia.localeCompare(tib, 'pt-BR', { sensitivity: 'base' }) || ta.localeCompare(tb, 'pt-BR', { sensitivity: 'base' });
      case 'recentes':
      default:
        // Sem data, usamos ordem natural (últimos adicionados no final do CSV = aparecem por último)
        return 0;
    }
  });

  renderConteudos(lista);
}

async function carregarTiposConteudo() {
  const select = document.getElementById('dropTipo');
  const filtroSelect = document.getElementById('filtroTipo');
  if (!select && !filtroSelect) return;

  const preencher = (el, tipos) => {
    if (!el) return;
    el.innerHTML = el.id === 'dropTipo' ? '<option value="">Selecione um tipo</option>' : '<option value="">Todos os tipos</option>';
    tipos.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = capitalizar(t);
      el.appendChild(opt);
    });
  };

  try {
    const resp = await fetch('/api/tipo');
    const tipos = await resp.json();
    if (Array.isArray(tipos) && tipos.length) {
      preencher(select, tipos);
      preencher(filtroSelect, tipos);
    } else {
      const fallback = ['fluviometrico', 'atmosferico'];
      preencher(select, fallback);
      preencher(filtroSelect, fallback);
    }
  } catch (err) {
    console.error('Erro ao carregar tipos:', err);
    const fallback = ['fluviometrico', 'atmosferico'];
    preencher(select, fallback);
    preencher(filtroSelect, fallback);
  }
}

function renderConteudos(conteudos) {
  const containerRow = document.getElementById('divConteudo');
  if (!containerRow) return;

  if (!conteudos.length) {
    containerRow.innerHTML = `
      <div class="col">
        <div class="mt-4 p-5 bg-light text-dark rounded text-center">
          <p class="mb-0">Nenhum conteúdo cadastrado ainda.</p>
        </div>
      </div>
    `;
    return;
  }

  const accordionId = 'accordionConteudos';
  let html = `
    <div class="col">
      <div class="mt-4 p-5 bg-light text-dark rounded">
        <div class="accordion" id="${accordionId}">
  `;

  conteudos.forEach((c, idx) => {
    const itemId = `conteudo_${idx}`;
    const titulo = c.titulo || `Conteúdo ${idx + 1}`;
    const descricao = c.descricao || '';
    const tipo = c.tipo ? capitalizar(c.tipo) : 'Tipo não informado';
    const popular = c.popular || '';
    const cientifico = c.cientifico || '';

    html += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading_${itemId}">
          <button class="accordion-button ${idx === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${itemId}" aria-expanded="${idx === 0 ? 'true' : 'false'}" aria-controls="collapse_${itemId}">
            ${escapeHtml(titulo)}
          </button>
        </h2>
        <div id="collapse_${itemId}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" data-bs-parent="#${accordionId}">
          <div class="accordion-body">
            <p><strong>Tipo:</strong> ${escapeHtml(tipo)}</p>
            ${popular ? `<p><strong>Nome Popular:</strong> ${escapeHtml(popular)}</p>` : ''}
            ${cientifico ? `<p><strong>Nome Científico:</strong> ${escapeHtml(cientifico)}</p>` : ''}
            ${descricao ? `<p><strong>Descrição:</strong> ${escapeHtml(descricao)}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;

  containerRow.innerHTML = html;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]+/g, function (s) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
    return map[s] || s;
  });
}

function capitalizar(str) {
  return String(str)
    .toLowerCase()
    .replace(/(^|\s)([a-zãõáéíóúç])/g, (_, p1, p2) => p1 + p2.toUpperCase());
}

