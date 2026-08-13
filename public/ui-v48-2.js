/* CuHalide Atlas UI hardening layer v48.2
   Presentation only: no scientific data, retrieval or access-policy semantics. */
(() => {
  'use strict';

  const mobile = window.matchMedia('(max-width: 780px)');
  const tablet = window.matchMedia('(max-width: 1120px)');
  const byId = id => document.getElementById(id);
  const value = id => (byId(id)?.value || '').trim();
  const nativeFetch = window.fetch.bind(window);

  const RESPONSIVE_PAGE_SIZES = Object.freeze({
    articles: () => tablet.matches ? 12 : 18,
    structures: () => mobile.matches ? 12 : (tablet.matches ? 20 : 30),
    polar: () => mobile.matches ? 12 : (tablet.matches ? 20 : 30),
  });

  /*
   * The core portal script is CSP hash-bound and remains byte-for-byte untouched.
   * Presentation density is therefore applied only to same-origin public-data GET
   * requests. Counts, filters, curation layers and scientific semantics are unchanged.
   */
  window.fetch = (input, init) => {
    try {
      const raw = input instanceof Request ? input.url : String(input);
      const url = new URL(raw, window.location.href);
      const action = url.searchParams.get('action');
      const sizeFor = RESPONSIVE_PAGE_SIZES[action];
      if (url.origin === window.location.origin && url.pathname === '/api/public-data' && sizeFor) {
        url.searchParams.set('page_size', String(sizeFor()));
        if (input instanceof Request) return nativeFetch(new Request(url.href, input), init);
        if (input instanceof URL) return nativeFetch(url, init);
        return nativeFetch(url.href, init);
      }
    } catch {
      /* Fall through unchanged for opaque/non-URL fetch inputs. */
    }
    return nativeFetch(input, init);
  };

  function activeArticleFilters() {
    let n = 0;
    ['aq','ayf','ayt','ahal','adim','acat','aev','ascope'].forEach(id => { if (value(id)) n += 1; });
    if (value('arel') && value('arel') !== 'Current canonical') n += 1;
    if (value('asort') && value('asort') !== 'year_desc') n += 1;
    return n;
  }

  function activeStructureFilters() {
    let n = 0;
    ['sq','shal','sdim','ssg','sconf','spolar'].forEach(id => { if (value(id)) n += 1; });
    if (value('selig') && value('selig') !== 'Core - Included') n += 1;
    return n;
  }

  function activePolarFilters() {
    let n = 0;
    ['pq','phal','psg'].forEach(id => { if (value(id)) n += 1; });
    return n;
  }

  function buildFilterToggle(panel, getCount, resultId, fieldIds) {
    if (!panel || panel.dataset.uiFilterReady === '1') return;
    panel.dataset.uiFilterReady = '1';
    panel.classList.add('ui-filter-panel');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-filter-toggle';
    toggle.innerHTML = '<span>Filters</span><span class="ui-count">No extra filters</span><span class="ui-chevron" aria-hidden="true">⌄</span>';
    toggle.setAttribute('aria-expanded', 'true');
    panel.insertBefore(toggle, panel.firstChild);

    const done = document.createElement('button');
    done.type = 'button';
    done.className = 'mobile-filter-done';
    done.textContent = 'View results';
    panel.appendChild(done);

    const update = () => {
      const count = getCount();
      const countNode = toggle.querySelector('.ui-count');
      if (countNode) countNode.textContent = count ? `${count} active` : 'Default view';
      toggle.setAttribute('aria-expanded', String(!panel.classList.contains('ui-collapsed')));
    };

    const setMobileState = () => {
      if (mobile.matches) panel.classList.add('ui-collapsed');
      else panel.classList.remove('ui-collapsed');
      update();
    };

    toggle.addEventListener('click', () => {
      panel.classList.toggle('ui-collapsed');
      update();
    });

    done.addEventListener('click', () => {
      panel.classList.add('ui-collapsed');
      update();
      const target = byId(resultId);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    fieldIds.forEach(id => {
      const el = byId(id);
      if (!el) return;
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });

    ['areset','sreset'].forEach(id => {
      const el = byId(id);
      if (el && panel.contains(el)) el.addEventListener('click', () => setTimeout(update, 0));
    });

    setMobileState();
    if (mobile.addEventListener) mobile.addEventListener('change', setMobileState);
    else mobile.addListener(setMobileState);
  }

  function enhanceFilters() {
    buildFilterToggle(
      document.querySelector('.view[data-view="articles"] .filters'),
      activeArticleFilters,
      'acount',
      ['aq','ayf','ayt','ahal','adim','acat','aev','ascope','arel','asort']
    );

    buildFilterToggle(
      byId('selig')?.closest('.panel'),
      activeStructureFilters,
      'scount',
      ['sq','shal','sdim','ssg','sconf','spolar','selig']
    );

    buildFilterToggle(
      byId('pq')?.closest('.panel'),
      activePolarFilters,
      'pcount',
      ['pq','phal','psg']
    );
  }

  function enhanceRagSetup() {
    const panel = document.querySelector('.rag-side');
    if (!panel || panel.dataset.uiRagReady === '1') return;
    panel.dataset.uiRagReady = '1';
    panel.classList.add('ui-rag-panel');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-panel-toggle';
    toggle.innerHTML = '<span>Research setup</span><span class="ui-chevron" aria-hidden="true">⌄</span>';
    toggle.setAttribute('aria-expanded', 'true');
    panel.insertBefore(toggle, panel.firstChild);

    const update = () => toggle.setAttribute('aria-expanded', String(!panel.classList.contains('ui-collapsed')));
    const setMobileState = () => {
      if (mobile.matches) panel.classList.add('ui-collapsed');
      else panel.classList.remove('ui-collapsed');
      update();
    };

    toggle.addEventListener('click', () => {
      panel.classList.toggle('ui-collapsed');
      update();
    });

    setMobileState();
    if (mobile.addEventListener) mobile.addEventListener('change', setMobileState);
    else mobile.addListener(setMobileState);
  }

  function enhanceLongPageNavigation() {
    if (document.querySelector('.ui-backtop')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ui-backtop';
    button.textContent = '↑ Top';
    button.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(button);

    const sync = () => button.classList.toggle('show', window.scrollY > 900);
    window.addEventListener('scroll', sync, { passive: true });
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    sync();
  }

  function enhanceNavigation() {
    const nav = byId('nav');
    const menu = byId('menu');
    if (!nav || !menu) return;

    document.addEventListener('click', event => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(event.target) || menu.contains(event.target)) return;
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !nav.classList.contains('open')) return;
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.focus();
    });
  }

  function enhanceYearChart() {
    const chart = byId('yearChart');
    if (!chart) return;
    chart.tabIndex = 0;
    chart.setAttribute('aria-describedby', 'yearChartHint');

    let hint = byId('yearChartHint');
    if (!hint) {
      hint = document.createElement('span');
      hint.id = 'yearChartHint';
      hint.className = 'sr-only';
      hint.textContent = 'The chart is horizontally scrollable on smaller screens and initially shows the most recent years.';
      chart.parentNode?.insertBefore(hint, chart.nextSibling);
    }

    let positioned = false;
    const positionRecent = () => {
      if (!mobile.matches || positioned || chart.scrollWidth <= chart.clientWidth) return;
      chart.scrollLeft = chart.scrollWidth;
      positioned = true;
    };

    const observer = new MutationObserver(() => requestAnimationFrame(positionRecent));
    observer.observe(chart, { childList: true });
    requestAnimationFrame(positionRecent);
  }

  function markInteractiveTables() {
    document.querySelectorAll('.view[data-view="structures"] .table-wrap,.view[data-view="polar"] .table-wrap').forEach(wrap => {
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', wrap.closest('[data-view="polar"]') ? 'Strict polar structure results' : 'Structure register results');
    });
  }

  function init() {
    document.documentElement.classList.add('ui-v48-2');
    enhanceFilters();
    enhanceRagSetup();
    enhanceLongPageNavigation();
    enhanceNavigation();
    enhanceYearChart();
    markInteractiveTables();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
