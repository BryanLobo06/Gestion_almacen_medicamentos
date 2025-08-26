const form = document.getElementById("loginForm");

form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData(form);

    const data = {
        email: formData.get("Email"),
        password: formData.get("Password"),
    };

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ " + result.message);
            // Aquí puedes redirigir al usuario o guardar el token si es necesario (ejemplo: window.location.href = "home.html";)
        } else {
            alert("❌ " + result.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});
