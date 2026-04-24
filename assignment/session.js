const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());

// ================= Session =================
app.use(session({
  secret: 'cart-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// ================= Init Cart =================
const initCart = (req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
};

app.use(initCart);

// ================= Add Item =================
app.post('/cart/add', (req, res) => {
  const { productId, name, price, quantity } = req.body;

  if (!productId || !price || !quantity) {
    return res.status(400).send("Missing fields");
  }

  const existingItem = req.session.cart.find(
    item => item.productId === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    req.session.cart.push({
      productId,
      name,
      price,
      quantity
    });
  }

  res.send("Item added to cart");
});

// ================= Update Quantity =================
app.put('/cart/update/:productId', (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const item = req.session.cart.find(
    item => item.productId === productId
  );

  if (!item) {
    return res.status(404).send("Item not found");
  }

  if (quantity <= 0) {
    return res.status(400).send("Invalid quantity");
  }

  item.quantity = quantity;

  res.send("Quantity updated");
});

// ================= Remove Item =================
app.delete('/cart/remove/:productId', (req, res) => {
  const { productId } = req.params;

  req.session.cart = req.session.cart.filter(
    item => item.productId !== productId
  );

  res.send("Item removed");
});

// ================= Get Cart =================
app.get('/cart', (req, res) => {
  const cart = req.session.cart;

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  res.json({
    items: cart,
    totalPrice: total
  });
});

// ================= Clear Cart =================
app.delete('/cart/clear', (req, res) => {
  req.session.cart = [];
  res.send("Cart cleared");
});

// ================= Server =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
