const fs = require('fs').promises;
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: String,
  description: String,
  units: Number,
  tags: [String],
  year: String, 
});

const Course = mongoose.model('Course', courseSchema);

async function retrieveBackendCourses() {
  const backendCourses = await Course.find({ tags: "BSIS" }).sort({ code: 1 });
  console.log('Published Backend Courses (sorted alphabetically):');
  console.log(backendCourses);
}

async function extractCourseInfo() {
  const allCourses = await Course.find();
  const courseInfo = allCourses.map(course => ({
    code: course.code !== undefined && course.code !== null ? course.code : '',
    description: course.description !== undefined && course.description !== null ? course.description : '',
    units: course.units !== undefined && course.units !== null ? course.units : '',
    tags: course.tags || [],
  }));
  console.log('Extracted Course Information:');
  console.log(courseInfo);
}



async function retrieveBSISCourses() {
  const bsisCourses = await Course.find({ tags: "BSIS" }).sort({ code: 1 });
  console.log('Published BSIS Courses:');
  console.log(bsisCourses);
}

async function retrieveBSITCourses() {
  const bsitCourses = await Course.find({ tags: "BSIT" });
  console.log('Published BSIT Courses:');
  console.log(bsitCourses);
}


mongoose.connect('mongodb+srv://saguidlovely:password12345@cluster0.41uljuk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    try {
      console.log('Connected to MongoDB');
      console.log('Current Working Directory:', process.cwd());

      const filePath = 'C:/Users/Lovely Saguid/saguid-server/courses.js';

      const rawData = await fs.readFile(filePath, 'utf8');

      const yearsData = JSON.parse(rawData);

      const flattenedCourses = [];
      yearsData.forEach(year => {
        const yearInfo = Object.keys(year)[0];
        const coursesData = Object.values(year)[0];
        
        coursesData.forEach(course => {
          if (course.tags && course.tags.length > 0) {
            course.tags = course.tags.map(tag => tag.toLowerCase());
          }
          course.year = yearInfo; 
          flattenedCourses.push(course);
        });
      });

      await Course.insertMany(flattenedCourses);
      console.log('Courses successfully inserted to MongoDB');

      await retrieveBackendCourses();
      await extractCourseInfo();
      await retrieveBSISCourses();
      await retrieveBSITCourses();

      mongoose.connection.close();
    } catch (error) {
      console.error('Error:', error);
    }
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

