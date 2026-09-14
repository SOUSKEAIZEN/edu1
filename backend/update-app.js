const fs = require('fs');
let content = fs.readFileSync('src/app.ts', 'utf8');

if (!content.includes('studentRoutes')) {
  content = content.replace(
    "import authRoutes from './routes/auth.routes';", 
    "import authRoutes from './routes/auth.routes';\nimport studentRoutes from './routes/student.routes';\nimport mentorRoutes from './routes/mentor.routes';"
  );
  content = content.replace(
    "app.use('/api/auth', authRoutes);",
    "app.use('/api/auth', authRoutes);\napp.use('/api/student', studentRoutes);\napp.use('/api/mentor', mentorRoutes);"
  );
  fs.writeFileSync('src/app.ts', content);
}
