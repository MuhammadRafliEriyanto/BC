import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Branch } from './src/models/Branch';

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  const users = await User.find({ role: { $in: ['admin', 'owner'] } }).select('email role nama').exec();
  console.log('Admins/Owners:', users);
  const branches = await Branch.find();
  console.log('All branches:', branches.map(b => ({ name: b.name, admin: b.adminUserId })));
  process.exit(0);
});
