require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const familiesRoutes = require('./routes/families.routes');
const childrenRoutes = require('./routes/children.routes');
const activitiesRoutes = require('./routes/activities.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/families', familiesRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/activities', activitiesRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API جمعية خيرية - يعمل بنجاح' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
