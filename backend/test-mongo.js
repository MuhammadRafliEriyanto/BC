const { MongoClient } = require('mongodb');
const uri = 'mongodb://raflimhmmd621_db_user:MuhRafli310104%2A@ac-xoluqrw-shard-00-00.ahx9jjw.mongodb.net:27017,ac-xoluqrw-shard-00-01.ahx9jjw.mongodb.net:27017,ac-xoluqrw-shard-00-02.ahx9jjw.mongodb.net:27017/bimbel-lms?ssl=true&replicaSet=atlas-26q8td-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
  try {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db('bimbel-lms');
    const collections = await db.collections();
    console.log('Collections:', collections.map(c => c.collectionName));
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.close();
  }
}
run();
