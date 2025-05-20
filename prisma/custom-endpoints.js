// custom-endpoints.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const CustomEndpoints = (app, authenticateJWT, broadcastToClients) => {

  /**
  @use sends a signal to specific table name, use for live updates
  @param table_name 
  @function broadcastToClients(table_name) 
  **/

  // START ENDPOINTS HERE

  app.get('/api/test', authenticateJWT, async (req, res) => {
    res.json({'message':'Hello World'});
  });

  
  app.get('/api/prisma-test/:id', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          office: {
            select: {
              'name': true
            }
          }
        }
      });

      if (!profile) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.json(user);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Error fetching User.', details: e.message });
    }
  });


  // END ENDPOINTS HERE
}