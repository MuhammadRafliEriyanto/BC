import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Teacher } from './src/models/Teacher';
import { resolveAdminBranchScope } from './src/utils/adminBranchScope';

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  const user = await User.findOne({ email: 'dolphnss815@gmail.com' });
  const scope = await resolveAdminBranchScope(user, { requireManagedBranchesForAdmin: true });
  console.log('Scope:', scope);
  const teacher = await Teacher.findOne({ teacherId: 'TCH-001' });
  console.log('Teacher branches:', teacher?.branches);
  process.exit(0);
});
