import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_response';

await mongoose.connect(MONGO_URI);
console.log('Connected to MongoDB');

const db = mongoose.connection.db;
const col = db.collection('incidents');

const activeStatuses = ['open', 'investigating', 'identified', 'monitoring'];

// Find all active duplicate groups
const dups = await col.aggregate([
  { $match: { status: { $in: activeStatuses } } },
  { $sort: { createdAt: -1 } }, // newest first
  {
    $group: {
      _id: { companyId: '$companyId', title: '$title' },
      ids: { $push: '$_id' },
      count: { $sum: 1 },
    },
  },
  { $match: { count: { $gt: 1 } } },
]).toArray();

console.log(`Found ${dups.length} duplicate groups`);

for (const dup of dups) {
  const [keep, ...remove] = dup.ids; // first is newest (sorted -1)
  const res = await col.deleteMany({ _id: { $in: remove } });
  console.log(`  Kept: ${keep}, Removed ${res.deletedCount} duplicate(s) for: "${dup._id.title}"`);
}

// Drop existing indexes that might conflict, so Mongoose can recreate them
try {
  await col.dropIndex('unique_active_incident');
  console.log('Dropped old unique_active_incident index');
} catch (e) {
  console.log('No existing index to drop (OK)');
}

console.log('Cleanup complete!');
await mongoose.disconnect();
