/* content-loader.js
   Client-side router that loads HTML fragments from /pages/<slug>.html
   Uses hash routes like #/gallery or #/home. Also tries to load /pages/<slug>.js
   after inserting HTML so page-specific JS can run.
*/

(async function () {
  const defaultRoute = 'home';
  const contentEl = () => document.getElementById('page-content');
  const titleEl = () => document.getElementById('page-title');
  const pageInitRegistry = {};

  function parseRoute() {
    // location.hash looks like "#/gallery" or "" -> fall back to default
    const raw = (location.hash || '').replace(/^#\/?/, '');
    return raw ? raw.split('/')[0] : defaultRoute;
  }

  function getSiteBasePath() {
    const baseUri = document.baseURI || window.location.href;
    const parsed = new URL(baseUri);
    const pathname = parsed.pathname.replace(/\/+$/, '');
    if (!pathname || pathname === '/') return '/';
    const lastSegment = pathname.split('/').pop() || '';
    if (lastSegment.includes('.')) {
      return `${pathname.slice(0, pathname.lastIndexOf('/'))}/`;
    }
    return `${pathname}/`;
  }

  function resolveAssetUrl(assetPath) {
    if (!assetPath) return '';
    const basePath = getSiteBasePath();
    const baseUrl = new URL(`${window.location.origin}${basePath}`);
    return new URL(assetPath, baseUrl).toString();
  }

  async function fetchText(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`Fetch ${url} failed: ${r.status}`);
    return await r.text();
  }

  // attempt to load a fragment into #page-content
  async function loadPage(route) {
    const container = contentEl();
    if (!container) {
      console.warn('No #page-content element found.');
      return;
    }

    // show temporary loading state
    container.innerHTML = '<p>Loading...</p>';

    try {
      const htmlUrl = resolveAssetUrl(`pages/${route}.html`);
      const html = await fetchText(htmlUrl);
      container.innerHTML = html;
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
    }


      // set focus for accessibility so screen readers notice the change
      container.focus({ preventScroll: true });

      // set page title if the fragment included a data-title attribute on the root element
      const first = container.firstElementChild;
      if (first && first.dataset && first.dataset.title) {
        document.title = first.dataset.title + ' — ThatDimensionalWebsite';
        if (titleEl()) titleEl().textContent = first.dataset.title;
      } else {
        // fallback: capitalise route
        if (titleEl()) titleEl().textContent = route.charAt(0).toUpperCase() + route.slice(1);
      }

      // try to load an optional page-specific JS file (pages/<route>.js)
      // This allows page fragments to remain purely HTML while page logic is separated.
      try {
        await loadPageScript(route);
      } catch (err) {
        // no page script — ignore
      }

      // highlight active nav link
      updateActiveNav(route);
    } catch (err) {
      console.error(err);
      // show friendly 404 / error content
      container.innerHTML = `
        <section data-title="Not Found">
          <h3>Page not found</h3>
          <p>Could not load <code>pages/${route}.html</code>.</p>
        </section>
      `;
      if (titleEl()) titleEl().textContent = 'Not Found';
      updateActiveNav(null);
    }
  }

  function registerPageInit(route, initFn) {
    if (typeof initFn === 'function') {
      pageInitRegistry[route] = initFn;
    }
  }

  function runPageInit(route) {
    const initFn = pageInitRegistry[route] || window.pageInit;
    if (typeof initFn === 'function') {
      try { initFn(); } catch (e) { console.error('pageInit error', e); }
    }
  }

  // Dynamically append a <script> for page logic if file exists
  function loadPageScript(route) {
    return new Promise(async (resolve, reject) => {
      const scriptUrl = resolveAssetUrl(`pages/${route}.js`);
      try {
        // quick HEAD check to avoid 404 noisy errors (some hosts don't allow HEAD; if so skip)
        const head = await fetch(scriptUrl, { method: 'HEAD', cache: 'no-cache' });
        if (!head.ok) return reject(new Error('no script'));
      } catch (err) {
        // HEAD might fail on some hosts — attempt to load and handle error
      }

      const existing = document.querySelector(`script[data-route="${route}"]`);
      if (existing) {
        existing.remove();
      }

      const s = document.createElement('script');
      s.src = `${scriptUrl}?v=${Date.now()}`;
      s.defer = true;
      s.dataset.route = route;
      s.onload = () => {
        // If the page script exposes pageInit(), register it for this route and call it.
        if (window.pageInit && typeof window.pageInit === 'function') {
          registerPageInit(route, window.pageInit);
          runPageInit(route);
        }
        resolve();
      };
      s.onerror = () => {
        s.remove();
        reject(new Error('script load failed'));
      };
      document.body.appendChild(s);
    });
  }

  function updateActiveNav(route) {
    const links = document.querySelectorAll('.sidenav .nav-link');
    links.forEach(a => {
      // link href like "#/gallery" -> extract slug, compare
      const href = (a.getAttribute('href') || '').replace(/^#\/?/, '');
      if (href === route) {
        a.classList.add('active'); // you can style .active in CSS
      } else {
        a.classList.remove('active');
      }
    });
  }

  // Listen to hash changes and page load
  window.addEventListener('hashchange', () => {
    const route = parseRoute();
    loadPage(route);
  });

  // Initial load
  const initial = parseRoute();
  loadPage(initial);
})();
