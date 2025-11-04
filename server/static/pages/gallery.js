// pages/gallery.js
// This file is loaded by content-loader.js after the HTML fragment is inserted.
// It exposes window.pageInit() which content-loader calls automatically.

window.pageInit = (function () {
  // gallery data (use image paths relative to index.html)
  const galleryImages = [
    { 
      src: '/static/images/ratman-remref.jpg', 
      title: 'Rem Ref Sheet', 
      artist: 'Ratman', 
      artistLink: '', 
      description: 'Heres Rem, a multiversal traveller (and my main sona!). Hes a mix of a Fennec Fox, Kangaroo and Silk Moth.', 
      nsfw: false 
    },
    { 
      src: '/static/images/bethany-arachnaref.png', 
      title: 'Arachna Ref Sheet', 
      artist: 'BethanyGC', 
      artistLink: 'https://bsky.app/profile/bethanisagoose.bsky.social', 
      description: 'Heres Arachna, the multiverses greatest mercenary! Dispite Rem being a pacifist, the two are best of friends and share a cabin out in the multiversal void.', 
      nsfw: false 
    },
    { 
      src: '/static/images/bethany-zoroark.png', 
      title: 'Selene the Zoroark', 
      artist: 'BethanyGC', 
      artistLink: 'https://bsky.app/profile/bethanisagoose.bsky.social', 
      description: 'My pokesona! They use their illusions to hypnotise people (though they are extra susceptible themselves)', 
      nsfw: false 
    },
    { 
      src: '/static/images/NSFW/kippz-zoroark.png', 
      title: 'Selene Nulge', 
      artist: 'Kippz', 
      artistLink: 'https://bsky.app/profile/kippz.bsky.social', 
      description: 'Seems that those spirals were too enticing for Selene. Hypnotised herself while stuck as a latex zoroark~', 
      nsfw: true 
    },
    { 
      src: '/static/images/duderedblue-kitsune.png', 
      title: 'Rem Kitsune', 
      artist: 'DudeRedBlue', 
      artistLink: 'https://www.furaffinity.net/user/redbluedude/', 
      description: 'Kitsunes are a personal favorite, what can I say?', 
      nsfw: false 
    },
    { 
      src: '/static/images/NSFW/nasty-hypno.png', 
      title: 'Rem Hypno Visor', 
      artist: 'NaughtySwirls', 
      artistLink: 'https://naughtyswirls.carrd.co/', 
      description: 'Good drones obey... Im a good drone... good drones obey... Im a good drone... ', 
      nsfw: true 
    },
    { 
      src: '/static/images/bethany-hypno.png', 
      title: 'Rem Pocketwatch', 
      artist: 'BethanyGC', 
      artistLink: 'https://bsky.app/profile/bethanisagoose.bsky.social', 
      description: 'My favorate hypnosis art I have ever gotten! Wish someone would do that to me- I mean what?', 
      nsfw: false 
    },
    { 
      src: '/static/images/lovelock-small.png', 
      title: 'Rem Small', 
      artist: 'Lovelock', 
      artistLink: 'https://lovelockart.carrd.co/', 
      description: 'Hey, Im down here! Hey!', 
      nsfw: false 
    },
    { 
      src: '/static/images/lovelock-paws.png', 
      title: 'Rem Paws', 
      artist: 'Lovelock', 
      artistLink: 'https://lovelockart.carrd.co/', 
      description: 'Dont my paws look tasty~?', 
      nsfw: false 
    },
    { 
      src: '/static/images/lovelock-hypno.jpg', 
      title: 'Rem Hypno', 
      artist: 'Lovelock', 
      artistLink: 'https://lovelockart.carrd.co/', 
      description: 'Am I hypnotising, or getting hypnotised? Ill let you decide~', 
      nsfw: false 
    },
    { 
      src: '/static/images/lovelock-muzzle.jpg', 
      title: 'Rem Muzzle', 
      artist: 'Lovelock', 
      artistLink: 'https://lovelockart.carrd.co/', 
      description: 'Hey, dont muzzle me! I promise I wont talk back ag- mmmmhhhffff!', 
      nsfw: false 
    },
    { 
      src: '/static/images/sira-latexhypno.png', 
      title: 'Rem Latex', 
      artist: 'SiraWox', 
      artistLink: 'https://bsky.app/profile/sirawox.bsky.social', 
      description: 'Rem accidentally got turned into latex... but they dont seem too unhappy about it~', 
      nsfw: false 
    },
    { 
      src: '/static/images/sleeplesskiwi-headshot.png', 
      title: 'Rem (Cool)', 
      artist: 'Sleepless Kiwi', 
      artistLink: 'https://sleeplesskiwi.carrd.co/', 
      escription: 'Got this as a bonus for donating for someones car repairs. Thanks Kiwi!', 
      nsfw: false 
    },
    { 
      src: '/static/images/ratman-hottub.png', 
      title: 'Rem Hottub', 
      artist: 'Ratman', 
      artistLink: '', 
      description: 'Relaxing with Serahbellite and Alexis Rose!', 
      nsfw: false 
    },
    { 
      src: '/static/images/ratman-metal.png', 
      title: 'Rem & Wolfstorm', 
      artist: 'Ratman', 
      artistLink: '', 
      description: 'Liquid metal sonas sure are fun when they coat you~', 
      nsfw: false 
    },
    { 
      src: '/static/images/NSFW/ratman-chastity.png', 
      title: 'Rem Chastity', 
      artist: 'Ratman', 
      artistLink: '', 
      description: 'The first NSFW art I ever commissioned. Also started my love for chastity~', 
      nsfw: true 
    }
  ];

  let showNSFW = false;

  // Create a fullscreen overlay to show clicked images
  function openFullscreen(src, title = '') {
    // remove any existing overlay first
    const existing = document.querySelector('.fullscreen-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', title || 'Image preview');
    Object.assign(overlay.style, {
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)', zIndex: 9999, cursor: 'zoom-out'
    });

    const img = document.createElement('img');
    img.src = src;
    img.alt = title || '';
    Object.assign(img.style, { maxWidth: '95%', maxHeight: '95%', borderRadius: '8px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' });

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // close on click outside or Escape
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const close = () => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener('keydown', onKey);
    };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
  }

  // Build the gallery into #gallery-container
  function generateGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    container.innerHTML = '';
    const imagesToShow = showNSFW ? galleryImages : galleryImages.filter(img => !img.nsfw);

    imagesToShow.forEach(image => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', image.title || 'Open image');

      // image element with graceful fallback
      const imgEl = document.createElement('img');
      imgEl.src = image.src;
      imgEl.alt = image.title || '';
      imgEl.className = 'w-full object-cover rounded';
      imgEl.style.height = '300px';
      imgEl.onerror = () => {
        const placeholder = document.createElement('div');
        placeholder.className = 'missing';
        placeholder.textContent = 'Image not found';
        if (imgEl.parentNode) imgEl.parentNode.replaceChild(placeholder, imgEl);
      };

      card.appendChild(imgEl);

      // title
      const title = document.createElement('h4');
      title.className = 'font-semibold mt-2';
      title.textContent = image.title || '';
      card.appendChild(title);

      // artist
      const artistP = document.createElement('p');
      artistP.className = 'text-sm text-gray-500';
      if (image.artistLink) {
        const a = document.createElement('a');
        a.href = image.artistLink;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = image.artist || '';
        a.className = 'text-blue-500 hover:underline';
        artistP.appendChild(a);
      } else {
        artistP.textContent = image.artist || '';
      }
      card.appendChild(artistP);

      // description
      const desc = document.createElement('p');
      desc.className = 'text-sm text-gray-600 mt-1';
      desc.textContent = image.description || '';
      card.appendChild(desc);

      // interactions
      card.addEventListener('click', () => openFullscreen(image.src, image.title));
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openFullscreen(image.src, image.title); });

      container.appendChild(card);
    });
  }

  // Toggle NSFW and refresh
  function toggleNSFW() {
    showNSFW = !showNSFW;
    updateToggleText();
    generateGallery();
    return showNSFW;
  }

  function updateToggleText() {
    const btn = document.getElementById('nsfw-toggle');
    if (!btn) return;
    btn.textContent = showNSFW ? 'Hide NSFW' : 'Show NSFW';
  }

  // This function is called by content-loader.js after the fragment is inserted and script loaded.
  return function pageInit() {
    // wire up nsfw toggle button
    const toggleBtn = document.getElementById('nsfw-toggle');
    if (toggleBtn) {
      toggleBtn.removeEventListener('click', toggleNSFW);
      toggleBtn.addEventListener('click', toggleNSFW);
      updateToggleText();
    }

    // generate gallery now that the container exists
    generateGallery();

    // Optionally focus the gallery for keyboard users
    const container = document.getElementById('gallery-container');
    if (container) container.focus();
  };
})();
