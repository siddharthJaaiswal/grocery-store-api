// app.js

const express = require('express');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'grocery_store_db'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database: ', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Admin APIs
app.post('/api/admin/grocery', (req, res) => {
    const { name, price, inventory } = req.body;
    const sql = 'INSERT INTO groceries (name, price, inventory) VALUES (?, ?, ?)';
    connection.query(sql, [name, price, inventory], (err, result) => {
      if (err) {
        console.error('Error adding grocery item:', err);
        res.status(500).json({ error: 'An error occurred while adding the grocery item' });
        return;
      }
      res.status(201).json({ message: 'Grocery item added successfully' });
    });
});

app.get('/api/admin/grocery', (req, res) => {
    const sql = 'SELECT * FROM groceries where deleted_at is null';
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('Error retrieving grocery items:', err);
        res.status(500).json({ error: 'An error occurred while retrieving grocery items' });
        return;
      }
      res.json(results);
    });
});

app.post('/api/admin/grocery/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'update groceries set deleted_at = now() WHERE id = ?';
    connection.query(sql, id, (err, result) => {
      if (err) {
        console.error('Error removing grocery item:', err);
        res.status(500).json({ error: 'An error occurred while removing the grocery item' });
        return;
      }
      res.json({ message: 'Grocery item removed successfully' });
    });
});

app.put('/api/admin/grocery/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, inventory } = req.body;
    const sql = 'UPDATE groceries SET name = ?, price = ?, inventory = ? WHERE id = ?';
    connection.query(sql, [name, price, inventory, id], (err, result) => {
      if (err) {
        console.error('Error updating grocery item:', err);
        res.status(500).json({ error: 'An error occurred while updating the grocery item' });
        return;
      }
      res.json({ message: 'Grocery item updated successfully' });
    });
});

// User APIs
app.get('/api/user/grocery', (req, res) => {
    const sql = 'SELECT * FROM groceries WHERE inventory > 0';
    connection.query(sql, (err, results) => {
      if (err) {
        console.error('Error retrieving grocery items:', err);
        res.status(500).json({ error: 'An error occurred while retrieving grocery items' });
        return;
      }
      res.json(results);
    });
  });

app.post('/api/user/order', (req, res) => {
    const { items } = req.body;
    const sql = 'SELECT * FROM groceries WHERE id IN (?) AND inventory > 0';
    connection.query(sql, [items], (err, results) => {
      if (err) {
        console.error('Error retrieving selected grocery items:', err);
        res.status(500).json({ error: 'An error occurred while retrieving selected grocery items' });
        return;
      }
      
     
      if (results.length !== items.length) {
        res.status(400).json({ error: 'One or more selected items are not available' });
        return;
      }
  
      res.json({ message: 'Order placed successfully' });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
