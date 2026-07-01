import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './src/models/User';
import { Teacher } from './src/models/Teacher';
import { resolveAdminBranchScope } from './src/utils/adminBranchScope';

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  const req = {
    user: await User.findOne({ email: 'raflimhmmd621@gmail.com' }), // owner
  };
  console.log("Owner role:", req.user?.role);
  try {
    const scope = await resolveAdminBranchScope(req.user, { requireManagedBranchesForAdmin: true });
    const teacher = await Teacher.findOne({ teacherId: 'TCH-001' });

    if (!teacher) {
      throw new Error("Teacher TCH-001 tidak ditemukan.");
    }
    
    // Simulate what assertTeacherBranchAccess does
    const teacherBranchNames = Array.from(
      new Set(
        [teacher.branch, ...(teacher.branches ?? [])]
          .map((b) => b?.trim().replace(/\s+/g, " "))
          .filter(Boolean),
      ),
    );
    
    console.log("Teacher branch names:", teacherBranchNames);
    console.log("Scope is scoped to managed branches?", scope.isScopedToManagedBranches);
    
    // Test for admin dolphnss815@gmail.com
    const reqAdmin = { user: await User.findOne({ email: 'dolphnss815@gmail.com' }) };
    const scopeAdmin = await resolveAdminBranchScope(reqAdmin.user, { requireManagedBranchesForAdmin: true });
    console.log("Admin scope:", scopeAdmin);
    
    // Evaluate matchesBranchScope for admin
    const isAllowedForAdmin = teacherBranchNames.some(branch => {
       const normalized = branch.toLowerCase();
       return scopeAdmin.managedBranches.some(m => m.toLowerCase() === normalized);
    });
    console.log("Is Admin allowed?", isAllowedForAdmin);

  } catch (err) {
    console.error(err);
  }
  process.exit(0);
});
