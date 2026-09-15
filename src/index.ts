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

app.get("/metadata", async(req, res)=>{
    const id  = req.query.id

    const query1 =`SELECT name,email,id  FROM users WHERE id=$1`
    const res1 = await pgClient.query(query1, [id])

    const query2 =`SELECT *  FROM address WHERE user_id=$1`
    const res2 =await pgClient.query(query2, [id])

    res.json({
        users: res1.rows[0],
        address: res1.rows[0]
    })
})


app.get("/better-metadata", async(req, res)=>{
    const id = req.query.id;

    const query =`SELECT users.id, users.name, users.email, address.city, address.country, address.street, address.pin 
    FROM users FULL JOIN address ON users.id = address.user_id
    WHERE users.id = $1
    `

    const response = await pgClient.query(query,[id])

     res.json({
        users: response.rows,
        
    })

    
})

app.listen(3000, ()=>{
    console.log("database connected");
    
})
