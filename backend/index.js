const express = require('express'); // Import Express framework
const cors = require('cors'); // Import CORS middleware
const app = express(); // Create Express app instance
const port = 5000; // Define server port

// CORS Configuration - Allow only your React frontend
const corsOptions = {
  origin: 'http://localhost:3000', // Only allow React app (change to your production URL later)
  credentials: true, // Allow cookies and authentication headers
  optionsSuccessStatus: 200 // For legacy browser support
};

// Apply CORS middleware with restrictions
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// API Routes
app.get('/api', (req, res) => { 
  res.json({ message: 'API is running' }); 
});

// Start server
app.listen(port, () => console.log(`Backend running on port ${port}`));
