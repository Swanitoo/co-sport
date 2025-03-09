// Ce script est injecté dans le HTML et s'exécute avant que React ne soit chargé
// pour éviter tout flash de couleur incorrect

export function ThemeScript() {
  const script = `
    (function() {
      try {
        // Fonction pour obtenir le thème actuel
        function getStoredTheme() {
          // Essayer de lire d'abord un thème depuis un cookie
          var cookieMatch = document.cookie.match(/theme=([^;]+)/);
          var cookieTheme = cookieMatch ? cookieMatch[1] : null;
          
          // Ensuite essayer localStorage
          var localTheme = localStorage.getItem('theme');
          
          // Retourner le premier trouvé ou le thème système par défaut
          return cookieTheme || localTheme || 'system';
        }
        
        // Appliquer le thème
        var theme = getStoredTheme();
        var root = document.documentElement;
        
        // Si le thème est 'system', détecter la préférence du système
        if (theme === 'system') {
          var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', isDark);
        } else {
          // Sinon appliquer le thème choisi
          root.classList.toggle('dark', theme === 'dark');
        }
      } catch (e) {
        console.error('Theme initialization error:', e);
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
