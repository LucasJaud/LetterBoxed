let logoutRegistrado = false;

function registrarLogout() {
    if (logoutRegistrado) return;
    logoutRegistrado = true;

    document.addEventListener('click', (e) => {
        if (e.target.closest('a[href="#/logout"]')) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
        }
    });
}

export function configurarNav(paginaAtiva) {
    const appHeader = document.querySelector('#app-header');
    if (appHeader) {
        appHeader.className = 'catalogo-header';
        const subtitulo = appHeader.querySelector('p');
        if (subtitulo) {
            subtitulo.style.display = 'none';
        }
    }

    const nav = document.querySelector('#app-nav');
    if (!nav) return;

    nav.classList.remove('nav-hidden');
    nav.innerHTML = `
        <a href="#/catalogo" class="${paginaAtiva === 'catalogo' ? 'active' : ''}">Catálogo</a>
        <a href="#/perfil" class="${paginaAtiva === 'perfil' ? 'active' : ''}">Meu Perfil</a>
        <a href="#/logout">Sair</a>
    `;

    registrarLogout();
}
