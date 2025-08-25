import mysql from "mysql2/promise"

/* creo la conexion a la base de datos */
export const pool = mysql.createPool({
    host:"127.0.0.1",
    database:"drugstore",
    port:"3306",
    user:"coder",
    password:"Qwe.123*",
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
})

/* pruebo la conexion a la base de datos */
async function tryConnection(){
    try{
        const connection = await pool.getConnection();
        console.log('succes connection');
        connection.release();
    } catch (error){
        console.error('fail connection:', error.message);
    }
}