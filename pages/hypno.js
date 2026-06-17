window.pageInit = (function () {
  const hypnoFiles = [
    {
      slug: "hypno-standard",
      title: "Base File",
      description: 
        ["Welcome to my first hypno file~ This file will act as a basis for the rest of my hypnosis files, as they will use the triggers from this file ^~^",
        "- This file requires u to be comfortable and have minimal distractions.",
        "- Put your devices on Do Not Disturb, and don't be doing anything other than listen to this file once you click play (no texting or watching videos cutie <3). I recommend having your eyes closed.",
        "- Headphones are highly recommended.",
        "- Make sure you are comfortable, either laying on a bed of sitting in a chair with your eyes closed.",
        "- After listening, I would recommend listening to the file once a day for the next 3 days, and after then once a week, to help them stick long-term. This applies to all my files"],
      spoilerDescription: ["This file gives u three triggers; a safeword (for getting out of trance/pausing triggers), a Drop trigger (for dropping you into trance. This trigger can only be used by people you trust) and a Wake Up trigger (to bring you up and out of trance)  "],
      tags: ["Hypnosis Audio", "Drop Trigger"],
      audio: "/Hypno/hypnostandardfile.mp3",
      downloadUrl: "/Hypno/hypnostandardfile.wav",
      nsfw: false
    },
    {
      slug: "hypno-obey-trigger",
      title: "OBEY Trigger",
      description: 
        ["Make sure to listen to the first file before this one, as this uses triggers from that original file. It's shorter than the first file, roughly 10mins <3",
        "- This file requires u to be comfortable and have minimal distractions.",
        "- Put your devices on Do Not Disturb, and don't be doing anything other than listen to this file once you click play (no texting or watching videos cutie <3). I recommend having your eyes closed.",
        "- Headphones are highly recommended.",
        "- Make sure you are comfortable, either laying on a bed of sitting in a chair with your eyes closed.",
        "- After listening, I would recommend listening to the file once a day for the next 3 days, and after then once a week, to help them stick long-term. This applies to all my files"],
      spoilerDescription: "Adds a trigger called OBEY. When someone says the phrase OBEY followed by any command, you will feel compelled to obey that command. Trying to resist it will make it stronger. You will recieve a spike of pleasure upon completing the command.",
      tags: ["Hypnosis Audio", "BASE File Triggers Required"],
      audio: "/Hypno/hypnoobeyfile.mp3",
      downloadUrl: "/Hypno/hypnoobeyfile.wav",
      nsfw: false
    },    
    {
      slug: "hypno-rewrite-trigger",
      title: "REWRITE Trigger",
      description: 
        ["Make sure to listen to the first file before this one, as this uses triggers from that original file. It's shorter than the first file, roughly 10mins <3",
        "- This file requires u to be comfortable and have minimal distractions.",
        "- Put your devices on Do Not Disturb, and don't be doing anything other than listen to this file once you click play (no texting or watching videos cutie <3). I recommend having your eyes closed.",
        "- Headphones are highly recommended.",
        "- Make sure you are comfortable, either laying on a bed of sitting in a chair with your eyes closed.",
        "- After listening, I would recommend listening to the file once a day for the next 3 days, and after then once a week, to help them stick long-term. This applies to all my files"],
      spoilerDescription: "Adds a trigger called REWRITE. When someone says the phrase 'REWRITE', followed by a statement, you will fully believe that statement to be true. (Example; 'REWRITE. Your fav color is purple' will make you believe ur fav color is, and has always been, purple.) This includes altering memories.",
      tags: ["Hypnosis Audio", "BASE File Triggers Required"],
      audio: "/Hypno/hypnorewritefile.mp3",
      downloadUrl: "/Hypno/hypnorewritefile.wav",
      nsfw: false
    },
    {
      slug: "hypno-love-subliminal",
      title: "Audio-disiac Subliminal",
      description: 
      [
        "You ever want to fall in love with me~? Well now you can! Pop this file on loop and feel your emotions get overwhelmed with my love~",
        "- The file is 1 minute long, but intended to loop, so please ensure your music player has looping enabled.",
        "- Please adjust the volume to a comfortable level so you can listen for long periods of time."
      ],
      spoilerDescription: "A subliminal focused on making the listener fall in love, and become obsessed, with me.",
      tags: ["Subliminal", "Emotion Play", "Love"],
      audio: "/Hypno/hypnosubliminallove.mp3",
      downloadUrl: "/Hypno/hypnosubliminallove.wav",
      nsfw: false
    },
    {
      slug: "hypno-drone-subliminal",
      title: "Drone Conversion Subliminal",
      description: 
      [
        "Your mind is too ful. Too much thinking. Listen to this and let it turn you into a mindless drone, only existing to serve~",
        "- The file is 1 minute long, but intended to loop, so please ensure your music player has looping enabled.",
        "- Please adjust the volume to a comfortable level so you can listen for long periods of time."
      ],
      spoilerDescription: "A subliminal focused on turning the user into a mindless drone, meant to serve.",
      tags: ["Subliminal", "Emotion Play", "Love"],
      audio: "/Hypno/dronesubliminals.mp3",
      downloadUrl: "/Hypno/dronesubliminals.wav",
      nsfw: false
    },
    
  ];

  function resolveAudioUrl(audioPath) {
    if (!audioPath) return '';
    if (/^(https?:)?\/\//i.test(audioPath)) return audioPath;
    return audioPath.startsWith('/') ? audioPath : `/${audioPath.replace(/^\.\//, '')}`;
  }

  function resolveFileUrl(filePath) {
    if (!filePath) return '';
    if (/^(https?:)?\/\//i.test(filePath)) return filePath;
    return filePath.startsWith('/') ? filePath : `/${filePath.replace(/^\.\//, '')}`;
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getSelectedFileSlug() {
    const hash = location.hash || '';
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return '';
    const params = new URLSearchParams(hash.slice(queryIndex + 1));
    return params.get('file') || '';
  }

  function setSelectedFileSlug(slug) {
    const nextHash = `#/hypno?file=${encodeURIComponent(slug)}`;
    if (location.hash !== nextHash) {
      location.hash = nextHash;
    }
  }

  function clearSelectedFileSlug() {
    if (location.hash !== '#/hypno') {
      location.hash = '#/hypno';
    }
  }

  function renderDescription(target, value) {
    if (Array.isArray(value)) {
      value.forEach((line, index) => {
        if (index > 0) {
          target.appendChild(document.createElement('br'));
        }
        target.appendChild(document.createTextNode(line));
      });
      return;
    }

    target.textContent = value || '';
  }

  function buildDescriptionPreview(file) {
    const preview = document.createElement('div');
    preview.className = 'relative mt-2 overflow-hidden text-xs leading-5 text-gray-300';
    preview.style.maxHeight = '5.75rem';

    const text = document.createElement('div');
    text.className = 'pr-2 text-center';
    renderDescription(text, file.description || '');
    preview.appendChild(text);

    const fade = document.createElement('div');
    fade.className = 'pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-900/95 to-transparent';
    preview.appendChild(fade);

    return preview;
  }

  function getFileSlug(file) {
    return file.slug || slugify(file.title);
  }

  function buildFileDetails(file) {
    const details = document.createElement('article');
    details.className = 'w-full rounded-3xl border border-pink-500/30 bg-zinc-900/80 p-6 shadow-2xl sm:p-8';

    const heading = document.createElement('h4');
    heading.className = 'text-2xl font-semibold text-pink-100 sm:text-3xl';
    heading.textContent = file.title || 'Untitled Hypno File';
    details.appendChild(heading);

    const description = document.createElement('p');
    description.className = 'mt-4 text-sm leading-7 text-gray-300 sm:text-base';
    renderDescription(description, file.description || '');
    details.appendChild(description);

    const spoiler = document.createElement('p');
    spoiler.className = 'mt-4 text-sm leading-7 text-amber-200/90 sm:text-base';
    renderDescription(spoiler, file.spoilerDescription || '');
    details.appendChild(spoiler);

    const tagContainer = document.createElement('div');
    tagContainer.className = 'mt-5 flex flex-wrap gap-2';
    (file.tags || []).forEach(tag => {
      const badge = document.createElement('span');
      badge.className = 'rounded-full bg-pink-600/20 px-2 py-1 text-xs text-pink-100';
      badge.textContent = tag;
      tagContainer.appendChild(badge);
    });
    details.appendChild(tagContainer);

    const audioWrap = document.createElement('div');
    audioWrap.className = 'mt-6';
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'metadata';
    audio.className = 'w-full';
    const resolvedAudioUrl = resolveAudioUrl(file.audio);
    audio.src = resolvedAudioUrl;
    const source = document.createElement('source');
    source.src = resolvedAudioUrl;
    source.type = resolvedAudioUrl.toLowerCase().endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
    audio.appendChild(source);
    audioWrap.appendChild(audio);
    details.appendChild(audioWrap);

    const downloadUrl = resolveFileUrl(file.downloadUrl || file.audio);
    if (downloadUrl) {
      const downloadWrap = document.createElement('div');
      downloadWrap.className = 'mt-4';

      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = '';
      downloadLink.target = '_blank';
      downloadLink.rel = 'noopener noreferrer';
      downloadLink.className = 'inline-flex items-center rounded-md border border-pink-400/40 bg-pink-500/15 px-3 py-1.5 text-sm font-medium text-pink-100 transition hover:bg-pink-500/25';
      downloadLink.textContent = 'Download';

      downloadWrap.appendChild(downloadLink);
      details.appendChild(downloadWrap);
    }

    return details;
  }

  function buildBackButton() {
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'mb-5 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-pink-100 shadow-lg transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-400';

    const icon = document.createElement('span');
    icon.className = 'text-lg leading-none';
    icon.textContent = '←';
    backButton.appendChild(icon);

    const label = document.createElement('span');
    label.textContent = 'Back';
    backButton.appendChild(label);

    backButton.addEventListener('click', clearSelectedFileSlug);
    return backButton;
  }

  function generateHypnoFiles() {
    const container = document.getElementById('hypno-container');
    if (!container) return;

    container.innerHTML = '';
    container.dataset.ready = 'true';
    const filesToShow = hypnoFiles.filter(file => !file.nsfw);
    const selectedSlug = getSelectedFileSlug();
    const selectedFile = selectedSlug ? filesToShow.find(file => getFileSlug(file) === selectedSlug) || null : null;

    if (selectedFile) {
      container.className = 'min-h-screen bg-transparent px-4 py-4 sm:px-6 lg:px-8';

      const shell = document.createElement('div');
      shell.className = 'mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl flex-col';

      shell.appendChild(buildBackButton());
      shell.appendChild(buildFileDetails(selectedFile));
      container.appendChild(shell);
      if (document.title !== `${selectedFile.title} — ThatDimensionalWebsite`) {
        document.title = `${selectedFile.title} — ThatDimensionalWebsite`;
      }
      const titleEl = document.getElementById('page-title');
      if (titleEl) titleEl.textContent = selectedFile.title || 'Hypno Files';
      return;
    }

    container.className = 'min-h-screen px-4 py-4 sm:px-6 lg:px-8';
    document.title = 'Hypno Files — ThatDimensionalWebsite';
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = 'Hypno Files';

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';

    filesToShow.forEach(file => {
      const card = document.createElement('button');
      const slug = getFileSlug(file);
      card.type = 'button';
      card.className = 'min-h-[15rem] rounded-2xl border border-pink-500/30 bg-zinc-900/70 p-4 text-left shadow-lg transition hover:-translate-y-0.5 hover:border-pink-300/60 hover:bg-zinc-800/95 focus:outline-none focus:ring-2 focus:ring-pink-400 sm:min-h-[16rem]';
      card.addEventListener('click', () => setSelectedFileSlug(slug));

      const cardInner = document.createElement('div');
      cardInner.className = 'flex h-full flex-col justify-between gap-4';

      const title = document.createElement('h4');
      title.className = 'text-center text-base font-semibold leading-tight text-pink-100';
      title.textContent = file.title || 'Untitled Hypno File';
      cardInner.appendChild(title);

      cardInner.appendChild(buildDescriptionPreview(file));

      const tagContainer = document.createElement('div');
      tagContainer.className = 'flex flex-wrap justify-center gap-2';
      (file.tags || []).forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'rounded-full bg-pink-600/20 px-2 py-1 text-[11px] leading-none text-pink-100';
        badge.textContent = tag;
        tagContainer.appendChild(badge);
      });
      cardInner.appendChild(tagContainer);

      card.appendChild(cardInner);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  return function pageInit() {
    generateHypnoFiles();
  };
})();
