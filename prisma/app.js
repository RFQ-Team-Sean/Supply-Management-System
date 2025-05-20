import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import  { PrismaClient, Prisma } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {WebSocketServer, WebSocket} from 'ws';
import http from 'http';
import {CustomEndpoints} from './custom-endpoints.js';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

if(process.env.USE_CORS == 'true'){
  app.use(cors());
}

const JWT_SECRET=process.env.JWT_SECRET;

// Create an HTTP server
const server = http.createServer(app);

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Get the token from Authorization header

  if (!token) {
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;  // Attach the user data to the request object
    next();
  });
};

const wss =  new WebSocketServer({server})


let clients = [];
wss.on('connection', (ws,req) => {
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const token = urlParams.get('token');

  if (!token) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Restricted Access: Connection Denied`)
    ws.close(1008, 'Access denied. No token provided.');
    return;
  }
  const user = jwt.verify(token, JWT_SECRET);
  ws.user = user; 
  // Add client to the list of connected clients
  const timestamp = new Date().toISOString(); // Get the current timestamp in ISO format
  console.log(`[${timestamp}] New client connected [${user.userId}]`);

  // Handle WebSocket client disconnection
  ws.on('close', () => {
    const timestamp = new Date().toISOString(); // Get the current timestamp in ISO format
    console.log(`[${timestamp}] Client Disconnected`);
    clients = clients.filter(client => client !== ws); // Remove client from list
  });
  ws.on('error', (error) => {
    console.error(`Error with client connection: ${error.message}`);
  })
  clients.push(ws);
});


function broadcastToClients(table) {
  if (clients.length === 0) {
    console.log('No clients connected to broadcast to.');
    return;
  }

  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Client To DB: ${table.toUpperCase()}`);

  clients.forEach(client => {
    try {
      
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(table));
      }
    } catch (error) {
      console.error(`Error sending message to client: ${error.message}`);
    }
  });
}




app.get('/api/auth/protected', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId; // Access userId from the JWT payload

    // Fetch user data from the database
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true, fullname: true, position: true, user_type:true, role:true, isAdmin:true,profile:true,officeId:true}
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }


    res.json({...user});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving user data.' , details:e.message});
  }
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // Access token expires in 1 hour
    );

    const refreshToken = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,  // Ideally use a different secret for refresh tokens
      { expiresIn: '7d' } // Refresh token expires in 7 days
    );


    res.json({ message: 'Login successful', accessToken, refreshToken });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error logging in.', details:e.message });
  }
});
app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided.' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    // Optionally, check if the refresh token exists in your database (if you store it there)

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username },
      JWT_SECRET,
      { expiresIn: '1h' } // New access token expires in 1 hour
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ error: 'Invalid or expired refresh token.', details:e.message });
  }
});
app.get('/api/j/prisma', async (req, res) => {
  try {
      const { tables, include } = req.query;
      const tableArray = tables.split(',');
      
      // Assuming first table is the main model
      const mainTable = tableArray[0];
      const includeObj = JSON.parse(include)[mainTable];
      console.log(tables,include)
      const modelName = mainTable

      const result = await (prisma)[modelName].findMany(includeObj == true ? {}: includeObj);

      res.json( result);
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: 'Server error occurred while fetching data'
      });
  }
});
// Create a record in a dynamic table
app.get('/api/j/fetch',authenticateJWT, async (req, res) => {
  try {
    const { tables } = req.query;  // Extract the tables from the query parameters
    const tableNames = tables ? tables.split(',') : [];

    // If no tables are provided, return an error
    if (tableNames.length === 0) {
      return res.status(400).json({ error: 'No tables provided in the request.' });
    }

    // Validate that all tables exist in Prisma schema
    const invalidTables = tableNames.filter(table => !(table in prisma));
    if (invalidTables.length > 0) {
      return res.status(400).json({
        error: `Tables '${invalidTables.join(', ')}' do not exist in the schema.`,
      });
    }
    

    // Fetch data for each table (this will be a simple findMany for each table)
    const results = await Promise.all(
      tableNames.map(async (table) => {
        return await prisma[table].findMany();
      })
    );

    res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error joining tables.', details:e.message });
  }
});
app.post('/api/g/:table', authenticateJWT, async (req, res) => {
  try {
    const { table } = req.params;  // Get the table name from the URL
    const data = req.body;         // Get the data from the request body

    // Check if the table exists in Prisma's schema
    if (!(table in prisma)) {
      return res.status(400).json({ error: `Table '${table}' does not exist in the schema.` });
    }

    // Get the model schema for the table
    const model = prisma[table];
    const modelFields = Prisma.dmmf.datamodel.models.find(model => model.name === table.charAt(0).toUpperCase() + table.slice(1)).fields.filter(f=>f.kind!= 'object').map(f=>f.name)
    
    // Filter out any keys in the data object that are not part of the model fields
    const filteredData = Object.keys(data).reduce((acc, key) => {
      if (modelFields.includes(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    // If no valid fields are provided, return a bad request error
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to create.' });
    }

    // Create a new record in the specified table
    const resData = await model.create({
      data: filteredData,  // Only use valid fields for creation
    });

    broadcastToClients(table);  // Notify clients of the new record
    res.json(resData);          // Return the created record
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creating record.', details: e.message});
  }
});


// Read (Get) records from a dynamic table
app.get('/api/g/:table', authenticateJWT, async (req, res) => {
  try {
    const { table } = req.params;  // Get the table name from the URL
    const {
      limit = 100,    // Default limit of 100
      offset = 0,     // Default offset of 0
      sort,          // Sorting parameters
      filter,        // Filter conditions
      fields         // Specific fields to return
    } = req.query;


    // Check if the table exists in Prisma's schema
    if (!(table in prisma)) {
      return res.status(400).json({ error: `Table '${table}' does not exist in the schema.` });
    }

    // Parse query parameters
    const limitNum = parseInt(limit) || 100;
    const offsetNum = parseInt(offset) || 0;
    let sortObj = sort ? JSON.parse(sort) : undefined;
    let filterObj = filter ? JSON.parse(filter) : undefined;
    let selectFields = fields ? fields.split(',') : undefined;

    // Build Prisma query options
    const queryOptions = {
      take: limitNum,
      skip: offsetNum,
      where: filterObj,
      ...(sortObj && {
        orderBy: Object.entries(sortObj).map(([field, direction]) => ({
          [field]: direction.toLowerCase()
        }))[0] // Takes first sort condition
      }),
      ...(selectFields && {
        select: selectFields.reduce((acc, field) => ({
          ...acc,
          [field]: true
        }), {})
      })
    };

    // Retrieve filtered records from the specified table
    const records = await prisma[table].findMany(queryOptions);

    res.json(records);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error fetching records.', details: e.message });
  }
});

// Update (PUT) a record in a dynamic table
app.put('/api/g/:table/:id', authenticateJWT, async (req, res) => {
  try {
    const { table, id } = req.params;  // Get the table name and id from the URL
    const data = req.body;             // Get the data from the request body

    // Check if the table exists in Prisma's schema
    if (!(table in prisma)) {
      return res.status(400).json({ error: `Table '${table}' does not exist in the schema.` });
    }

    // Get the model schema for the table
    const model = prisma[table];

    const modelFields = Prisma.dmmf.datamodel.models.find(model => model.name === table.charAt(0).toUpperCase() + table.slice(1)).fields.filter(f=>f.kind!= 'object').map(f=>f.name)

    // Filter out any keys in the data object that are not part of the model fields
    const filteredData = Object.keys(data).reduce((acc, key) => {
      if (modelFields.includes(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    // If no valid fields are provided, return a bad request error
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    // Update the record in the specified table by id
    const updatedRecord = await model.update({
      where: { id: id },  // Ensure that the id is a number
      data: filteredData,         // Only update with valid fields
    });

    broadcastToClients(table); // Notify clients of the update
    res.json(updatedRecord);   // Return the updated record
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error updating record.', details: e.message });
  }
});


// Patch (partially update) a record in a dynamic table
app.patch('/api/g/:table/:id',authenticateJWT, async (req, res) => {
  try {
    const { table, id } = req.params;  // Get the table name and id from the URL
    const data = req.body;             // Get the data from the request body

    // Check if the table exists in Prisma's schema
    if (!(table in prisma)) {
      return res.status(400).json({ error: `Table '${table}' does not exist in the schema.` });
    }

    // Get the model schema for the table
    const model = prisma[table];
    // Get the fields of the model dynamically from Prisma's metadata
    const modelFields = Prisma.dmmf.datamodel.models.find(model => model.name ===  table.charAt(0).toUpperCase() + table.slice(1)).fields.filter(f=>f.kind!= 'object').map(f=>f.name)

    // Filter out any keys in the data object that are not part of the model fields
    const filteredData = Object.keys(data).reduce((acc, key) => {
      if (modelFields.includes(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    // If no valid fields are provided, return a bad request error
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    // Partially update a record in the specified table by id
    const updatedRecord = await model.update({
      where: { id: id },  // Ensure that the id is a number
      data: filteredData,
    });

    broadcastToClients(table);
    res.json(updatedRecord);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error partially updating record.' , details:e.message});
  }
});

// Patch (partially update) multiple records in a dynamic table
app.patch('/api/g/:table', authenticateJWT, async (req, res) => {
  try {
    const { table } = req.params;  // Get the table name from the URL
    const data = req.body;         // Get the data from the request body
    const filter = req.query.filter ? JSON.parse(req.query.filter) : {}; // Get filter from query

    // Check if the table exists in Prisma's schema
    if (!(table in prisma)) {
      return res.status(400).json({ error: `Table '${table}' does not exist in the schema.` });
    }

    // Get the model schema for the table
    const model = prisma[table];

    // Get the fields of the model dynamically from Prisma's metadata
    const modelFields = Prisma.dmmf.datamodel.models.find(model => model.name === table.charAt(0).toUpperCase() + table.slice(1)).fields.filter(f=>f.kind!= 'object').map(f=>f.name)
    // Filter out any keys in the data object that are not part of the model fields
    const filteredData = Object.keys(data).reduce((acc, key) => {
      if (modelFields.includes(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    // If no valid fields are provided, return a bad request error
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    // Partially update multiple records in the specified table based on the filter
    const updatedRecords = await model.updateMany({
      where: filter,  // Use filter to match records
      data: filteredData,  // Partially update matching records
    });

    broadcastToClients(table); // Notify clients of the update
    res.json(updatedRecords);   // Return the updated records
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error partially updating records.', details: e.message });
  }
});



// Delete a record from a dynamic table
app.delete('/api/g/:table/:id',authenticateJWT, async (req, res) => {
  try {
    const { table, id } = req.params;  // Get the table name and id from the URL

    // Check if the table exists in Prisma's schema
    if (!(table in prisma)) {
      return res.status(400).json({ error: `Table '${table}' does not exist in the schema.` });
    }

    // Delete a record from the specified table by id
    const deletedRecord = await prisma[table].delete({
      where: { id: id },
    });
    broadcastToClients(table);

    res.json(deletedRecord);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error deleting record.' , details:e.message});
  }
});

CustomEndpoints(app, authenticateJWT, broadcastToClients);

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
});
