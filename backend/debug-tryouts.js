const mongoose = require('mongoose');

const uri = "mongodb+srv://raflimhmmd621_db_user:MuhRafli310104*@cluster0.ahx9jjw.mongodb.net/bimbel-lms?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(async () => {
    const TeacherTryout = mongoose.model('TeacherTryout', new mongoose.Schema({}, { strict: false }));
    const tryouts = await TeacherTryout.find({});
    console.log(`TOTAL TRYOUTS IN DB: ${tryouts.length}`);
    tryouts.forEach(t => {
      console.log(`- ${t.title || t.judulTryout} | academicYear: ${t.academicYear} | semester: ${t.semester}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
