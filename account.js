// account-oauth.js (merge into account.js or include after it)
function openOAuthPopup(provider, urlPath='/auth/') {
  const w = 600, h = 700;
  const left = (screen.width/2) - (w/2);
  const top = (screen.height/2) - (h/2);
  // open popup to backend endpoint that will redirect to provider
  const popup = window.open(`${urlPath}${provider}`, 'oauth_'+provider, `width=${w},height=${h},left=${left},top=${top}`);
  if (!popup) {
    alert('Popup blocked — allow popups for this site.');
    return;
  }

  // listener for message from popup window
  window.addEventListener('message', function msgHandler(e) {
    // Optional security: check e.origin if you host backend on another origin
    const data = e.data || {};
    if (data.type === 'oauth_success' && data.provider === provider) {
      // cleanup
      window.removeEventListener('message', msgHandler);
      // refresh UI (calls your existing endpoint /api/me)
      refreshAccountUI();
    } else if (data.type === 'oauth_error' && data.provider === provider) {
      window.removeEventListener('message', msgHandler);
      alert('Login failed: ' + (data.error || 'unknown'));
    }
  }, false);
}

document.querySelectorAll('.oauth-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    openOAuthPopup(btn.dataset.provider);
  });
});
