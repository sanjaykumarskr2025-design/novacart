const ThemeManager = {
    init() {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        const savedTheme = localStorage.getItem('novacart_theme') || 'dark';

        document.documentElement.setAttribute('data-theme', savedTheme);

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('novacart_theme', next);
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
