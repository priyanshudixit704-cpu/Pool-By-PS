// ==========================================
// 8 BALL POOL - PWA CONTROLLER
// ==========================================
let deferredPrompt = null;

function initPWA() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('8 Ball Pool Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration skipped or failed:', err);
        });
    });
  }

  // Dismiss splash screen smoothly
  setTimeout(() => {
    const splash = document.getElementById("pwa-splash");
    if (splash) {
      splash.classList.add("hide");
    }
  }, 700);

  // Check if running standalone
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show Install Banner if not installed yet
    if (!isStandalone) {
      const banner = document.getElementById("pwa-install-banner");
      if (banner) banner.style.display = "flex";
    }
  });

  // Handle Install button click
  const installBtn = document.getElementById("btn-pwa-install");
  if (installBtn) {
    installBtn.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA installation prompt outcome:', outcome);
        deferredPrompt = null;
        const banner = document.getElementById("pwa-install-banner");
        if (banner) banner.style.display = "none";
      } else {
        showToast("To install: tap browser menu (⋮) -> 'Add to Home screen' or 'Install App'");
      }
    };
  }

  // Handle Dismiss button click
  const dismissBtn = document.getElementById("btn-pwa-dismiss");
  if (dismissBtn) {
    dismissBtn.onclick = () => {
      const banner = document.getElementById("pwa-install-banner");
      if (banner) banner.style.display = "none";
    };
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const banner = document.getElementById("pwa-install-banner");
    if (banner) banner.style.display = "none";
    showToast("8 Ball Pool installed successfully! Enjoy standalone mode.");
  });
}
