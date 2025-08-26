
document.addEventListener('DOMContentLoaded', () => {

    const toggle = document.getElementById('toggle');


    const modoGuardado = localStorage.getItem('modo');

    if (modoGuardado === 'oscuro') {
        document.body.classList.add('dark');
        toggle.checked = true;              
    }

    toggle.addEventListener('change', () => {

        if (toggle.checked) {
            document.body.classList.add('dark');
            localStorage.setItem('modo', 'oscuro'); 
        }
        else {
            document.body.classList.remove('dark');
            localStorage.setItem('modo', 'claro'); 
        }
    });

});
