const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// ---------------------------
// Connect to MongoDB Atlas
// ---------------------------
mongoose
  .connect(
    'mongodb+srv://Rio:RioAstal1234@rio.kh2t4sq.mongodb.net/myDatabase?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// ---------------------------
// Define Schema and Model
// ---------------------------
const recordSchema = new mongoose.Schema({
  value: Number,   // store as a number
  date: String     // store as string (YYYY-MM-DD)
});

// Ensure that when converting to JSON a virtual "id" property is included
recordSchema.set('toJSON', { virtuals: true });

const Record = mongoose.model('Record', recordSchema);

// ---------------------------
// Middleware Setup
// ---------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (graph.html, crud.html, etc.) from the current directory
app.use(express.static(__dirname));

// ---------------------------
// REST API Endpoints
// ---------------------------

/**
 * GET /data
 * Retrieves all records from the database.
 */
app.get('/data', async (req, res) => {
  try {
    const records = await Record.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /data
 * Creates a new record.
 * Expects JSON with keys: value, date.
 */
app.post('/data', async (req, res) => {
  const { value, date } = req.body;
  if (!value || !date) {
    return res.status(400).json({ error: 'Value and date are required.' });
  }
  try {
    const newRecord = new Record({ value: Number(value), date });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /data/:id
 * Updates an existing record by id.
 * Expects JSON with keys: value, date.
 */
app.put('/data/:id', async (req, res) => {
  const { value, date } = req.body;
  try {
    const updatedRecord = await Record.findByIdAndUpdate(
      req.params.id,
      { value: Number(value), date },
      { new: true }
    );
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Record not found.' });
    }
    res.json(updatedRecord);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /data/:id
 * Deletes an existing record by id.
 */
app.delete('/data/:id', async (req, res) => {
  try {
    const deletedRecord = await Record.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Record not found.' });
    }
    res.json(deletedRecord);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------------
// Start the Server
// ---------------------------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
