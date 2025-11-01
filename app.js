import express from 'express';

const app = express();

const PORT = 3012;

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true}));

const orders = [];

// default route 
app.get('/', (req, res) => {
  // res.sendFile(`${import.meta.dirname}/views/home.html`);
  res.render('home');
});

app.post("/confirm", (req, res) => {
  console.log("BODY:", req.body);

  const order = {
    name: req.body.name,
    email: req.body.email,
    flavor: req.body.flavor,
    method: req.body.method,
    toppings: req.body.toppings || [],
    comments: req.body.comments,
    timestamp: new Date().toLocaleString(),
  };

  orders.push(order);
  console.log("New Order:", order);

  res.render("confirm", { order });
});

app.get("/admin", (req, res) => {
  res.render("admin", { orders });
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});