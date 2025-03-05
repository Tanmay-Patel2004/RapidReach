const express = require('express');
const cookieParser = require('cookie-parser');
// ... other imports

const app = express();

// Cookie parser middleware
app.use(cookieParser());

// ... rest of your middleware and routes 