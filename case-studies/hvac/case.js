/* The public example uses synthetic data; no PDF upload, LLM or external call. */
(async () => {
  const script = document.currentScript;
  const lang = document.documentElement.lang.startsWith('pt') ? 'pt' : 'en';
  const copy = {
    en: { fields: ['Airflow', 'Available pressure', 'Filter class'], page: 'Page', present: 'Source present', missing: 'Needs review', absent: 'Not stated' },
    pt: { fields: ['Caudal', 'Pressão disponível', 'Classe de filtro'], page: 'Página', present: 'Com fonte', missing: 'Rever', absent: 'Não indicado' }
  }[lang];
  try {
    const base = new URL('.', script.src);
    const [inputResponse, outputResponse] = await Promise.all([
      fetch(new URL('example-input.json', base)), fetch(new URL('example-output.json', base))
    ]);
    if (!inputResponse.ok || !outputResponse.ok) throw new Error('Example unavailable');
    const [input, output] = await Promise.all([inputResponse.json(), outputResponse.json()]);
    const select = document.querySelector('#equipment');
    const fields = ['airflow_m3_h', 'pressure_pa', 'filter_class'];
    const formatValue = (value, index) => value === null ? copy.absent : String(value) + (index === 0 ? ' m³/h' : index === 1 ? ' Pa' : '');
    const update = () => {
      const source = input.sources.find(item => item.equipment === select.value);
      document.querySelector('#source-page').textContent = `${copy.page} ${source.page}`;
      document.querySelector('#source-text').textContent = `${source.equipment} · ` + fields.map((field, index) => `${copy.fields[index]}: ${formatValue(source[field], index)}`).join(' · ');
      document.querySelector('#output-equipment').textContent = source.equipment;
      const body = document.querySelector('#result-rows');
      body.replaceChildren(...output.rows.filter(row => row.equipment === source.equipment).map(row => {
        const index = fields.indexOf(row.field);
        const tr = document.createElement('tr');
        const th = document.createElement('th'); th.scope = 'row'; th.textContent = copy.fields[index]; tr.append(th);
        const values = [formatValue(row.value, index), row.source_page === null ? '—' : `${copy.page} ${row.source_page}`];
        values.forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); });
        const td = document.createElement('td'); const badge = document.createElement('span');
        badge.className = 'review-tag' + (row.status === 'needs_review' ? ' needs-review' : '');
        badge.textContent = row.status === 'needs_review' ? copy.missing : copy.present;
        td.append(badge); tr.append(td); return tr;
      }));
    };
    select.addEventListener('change', update);
    document.querySelector('.demo-controls').hidden = false;
    update();
  } catch (_) {
    // The initial HTML and download links provide the full example without JS.
  }
})();
