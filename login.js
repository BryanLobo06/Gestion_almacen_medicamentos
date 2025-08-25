/* guardo los datos del from en una varialble */
const form = document.getElementById("loginForm");

/* agrego un evento al formulario para que cuando se envie, se ejecute la funcion */
form.addEventListener("submit", async function(e){
    /* evito que se recargue la pagina */
    e.preventDefault();
    /* obtengo los datos del formulario */
    const formData = new FormData(form);
    /* creo un objeto con los datos del formulario */
    const data = {
        email: formData.get("Email"),
        password: formData.get("Password"),
    };
    
    try {
        /* guardo el endpoint en una variable */
        const url = new URL("http://localhost:3000/users");
        /* busco el parametro email en la url */
        url.searchParams.set("email", data.email);
        /* hago la peticion a la api */
        const response = await fetch(url, { method: "GET"});
        /* verifico si la respuesta es correcta */
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        /* obtengo los datos de la respuesta */
        const users = await response.json();
        /* verifico si el usuario existe y si la contraseña es correcta */
        const user = users[0];
        if (user && user.password === data.password) {
            alert("Login successful");
        } else {
            alert("Invalid email or password");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});