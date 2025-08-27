Cree un archivo llamado medicamentos.html con las vistas de lo que ve el usuario "simulando" pues, medicamentos.js que es el funcionamiento de el archivo dicho anteriormente, donde está la lógica, es decir, el crud.


No tengo la base de datos asi que los medicamentos los guardo en el navegador usando localstorage, simulando pues esta base de datos

hice un const llamado "repo" donde añado las funciones: 
- List: que devuelve los medicamentos con la clave "meds", si no existe devuelve un array vacío pues, Json.parse() para convertir el string a un array de objetos JS. O sea "SELECT * FROM medicamentos;"

- Get (ID): Llama internamente a list() para tener todos los registros, uso un find() para devolver el primer medicamento cuyo ID coincida con el parametro, o sea un "SELECT * FROM medicamentos WHERE id = ? LIMIT 1;"

-Create (med): Trae el array actual de medicamentos, o sea (repo.list()), inserta con push el nuevo objeto de "med". Convierte el array actualizado a JSON y lo guarda en localstorage, es como un "INSERT INTO medicamentos (loquesea) VALUES (loquesea);"

- Update (ID, PATCH): Obtiene todos los medicamentos, usé un map() para recorrer y reemplazar solo el que coincide con el id, el objeto nuevo se quenera con "spread operator" que combina los valores del patch y se sobreescribe en local storage, es como un "UPDATE medicamentos SET campo1 = valor1, campo2 = valor2 WHERE id = ?;"

- Remove(ID): Obtiene la lista completa, filtra el array dejando fuera el medicamento cuyo id coincide, sobreescribe eta lista en localstorage, es como un "DELETE FROM medicamentos WHERE id = ?;"


Lo que hago es simular la base de datos con localstorage, o sea, puedes modificar todo sin que se modifique el crud también incluyo pertenencia temporal con local storage


hice una lista inicial pa simular una base de datos, hice la interfaz grafica con cha yipiti, hice la lógica de stock y alerta, o sea stock = cantidad actual, recorderlevel = el mínimo recomendado, si el stock >= recorderlevel el estado mostrará "OK" si es menor mostrará "BAJO" en rojo


TODO funciona con un repositorio que ahora usa localstorage pero se puede cambiar por los ENDPOINTS, o sea GET /api/medicines, GET /api/medicines/:id, POST /api/medicines, PUT /api/medicines/:id, DELETE /api/medicines/:id

Lo que debería mostrar en el json de un medicamento es:

{
  "id": "123",
  "name": "Paracetamol",
  "presentation": "500mg tabletas",
  "unit": "tabletas",
  "stock": 120,
  "reorderLevel": 30,
  "expiration": "2026-08-01"
}


Y ya