window.pageInit = (function () {
  const hypnoFiles = [
    {
      title: "Hypno Standard",
      description: 
        ["This file requires u to be comfortable and have minimal distractions.",
        "Put your devices on Do Not Disturb, and don't be doing anything other than listen to this file once you click play (no texting or watching videos cutie <3). I recommend having your eyes closed.",
        "Headphones are highly recommended.",
        "Make sure you are comfortable, either laying on a bed of sitting in a chair with your eyes closed.",
        "After listening, I would recommend listening to the file once a day for the next 3 days, and after then once a week, to help them stick long-term. This applies to all my files"],
      spoilerDescription: ["Spoiler Description"],
      tags: ["Hypnosis Audio", "Drop Trigger"],
      audio: "/Hypno/hypnostandardfile.mp3",
      nsfw: false
    },
    {
      title: "test",
      description: "this is me testing.",
      spoilerDescription: "test description.",
      tags: ["stuff!", "things too!"],
      audio: "/Hypno/test.mp3",
      nsfw: true
    }
  ];

  let showNSFW = false;

  function resolveAudioUrl(audioPath) {
    if (!audioPath) return '';
    if (/^(https?:)?\/\//i.test(audioPath)) return audioPath;
    return audioPath.startsWith('/') ? audioPath : `/${audioPath.replace(/^\.\//, '')}`;
  }

  function generateHypnoFiles() {
    const container = document.getElementById('hypno-container');
    if (!container) return;

    container.innerHTML = '';
    container.dataset.ready = 'true';
    const filesToShow = showNSFW ? hypnoFiles : hypnoFiles.filter(file => !file.nsfw);

    filesToShow.forEach(file => {
      const card = document.createElement('article');
      card.className = 'rounded-lg border border-pink-500/30 bg-zinc-900/70 p-4 shadow-lg';

      const title = document.createElement('h4');
      title.className = 'font-semibold text-lg text-pink-200';
      title.textContent = file.title || 'Untitled Hypno File';
      card.appendChild(title);

      const description = document.createElement('p');
      description.className = 'mt-2 text-sm text-gray-300';
      description.textContent = file.description || '';
      card.appendChild(description);

      const spoiler = document.createElement('p');
      spoiler.className = 'mt-2 text-sm text-amber-200/90';
      spoiler.textContent = file.spoilerDescription || '';
      card.appendChild(spoiler);

      const tagContainer = document.createElement('div');
      tagContainer.className = 'mt-3 flex flex-wrap gap-2';
      (file.tags || []).forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'rounded-full bg-pink-600/20 px-2 py-1 text-xs text-pink-100';
        badge.textContent = tag;
        tagContainer.appendChild(badge);
      });
      card.appendChild(tagContainer);

      const audioWrap = document.createElement('div');
      audioWrap.className = 'mt-4';
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
      card.appendChild(audioWrap);

      container.appendChild(card);
    });
  }

  function toggleNSFW() {
    showNSFW = !showNSFW;
    updateToggleText();
    generateHypnoFiles();
    return showNSFW;
  }

  function updateToggleText() {
    const btn = document.getElementById('nsfw-toggle');
    if (!btn) return;
    btn.textContent = showNSFW ? 'Hide NSFW' : 'Show NSFW';
  }

  return function pageInit() {
    const toggleBtn = document.getElementById('nsfw-toggle');
    if (toggleBtn) {
      toggleBtn.removeEventListener('click', toggleNSFW);
      toggleBtn.addEventListener('click', toggleNSFW);
      updateToggleText();
    }

    generateHypnoFiles();
  };
})();
