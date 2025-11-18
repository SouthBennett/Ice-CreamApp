import express from 'express';

import mysql2 from 'mysql2';

import dotenv from 'dotenv';

dotenv.config();

const app = express();

const pool = mysql2.createPool({
  //These values come from the .env file
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
}).promise();

const PORT = 3012;

// Database test - http://localhost:3000/db-test to test this route
app.get('/db-test', async(req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders');

    // Send the orders data back to the browser as JSON
    res.send(orders);

  } catch(err) {
    // if Any error hapened in the 'try' block, this code runs
    // log the error to the server console (for developers to see)
    console.error('Database error:', err);

    // Send an error response to the browser
    // status(500) means "Internal Server Error"
    res.status(500).send('Database error: ' + err.message);
  }
});

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true}));

const orders = [];

// default route 
app.get('/', (req, res) => {
  // res.sendFile(`${import.meta.dirname}/views/home.html`);
  res.render('home');
});

app.post("/confirm", async(req, res) => {
  try {
    const order = req.body;

    console.log('New order submitted:', order);

    order.toppings = Array.isArray(order.toppings) ? order.toppings.join(", ") : "";

    const sql = `INSERT INTO orders(customer, email, flavor, cone, toppings)
    VALUES (?, ?, ?, ?, ?);`;

    const params = [
      order.name,
      order.email,
      order.flavor,
      order.method,
      order.toppings
    ];

    const [result] = await pool.execute(sql, params);
    console.log('Order saved with ID:', result.insertId);

    

  // const order = {
  //   name: req.body.name,
  //   email: req.body.email,
  //   flavor: req.body.flavor,
  //   method: req.body.method,
  //   toppings: req.body.toppings || [],
  //   comments: req.body.comments,
  //   timestamp: new Date().toLocaleString(),
  // };

  // orders.push(order);
  // console.log("New Order:", order);
  
  res.render("confirm", { order });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).send('Sorry, there was an error processing your order. Please try again.');
  }
});

app.get("/admin", async (req, res) => {
  try {
    //Fetch all orders from the database, newest first
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY timestamp DESC');
    // Render the admin page
    res.render("admin", { orders });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Error loading orders: ' + err.message);
  }  
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});