import {Client} from 'pg'
import express  from 'express';

const pgClient = new Client("postgresql://neondb_owner:npg_WPE8Rn6VdAUw@ep-red-tooth-axmkzcqy-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

const app = express()
app.use(express.json())
pgClient.connect();

app.post("/signup", async function(req,res){
    try {
    const {email, name, password} = req.body
    const {city, country, street, pin} = req.body

    const sqlQuery = `INSERT INTO users(email, name, password) VALUES ($1, $2, $3) RETURNING id`
    const addressQuery = `INSERT INTO address(city,country,street,pin,user_id) VALUES ($1, $2, $3, $4, $5)`
    
    await pgClient.query("BEGIN;")

    const response = await pgClient.query(sqlQuery,[email,name,password])
    const userId = response.rows[0].id

    await new Promise(x=> setTimeout(x, 100 * 100))
    const sqlInsertAddressResponse = await pgClient.query(addressQuery,[city, country, street, pin, userId])

    await pgClient.query("COMMIT;")
    
     res.json({
        message: "sign up successfully done"
    })

    } catch (error) {
        console.log(error);
        res.
        status(501).
        json({
            message: "duplicate values"
        })
    }
    
   
})

app.listen(3000, ()=>{
    console.log("database connected");
    
})
