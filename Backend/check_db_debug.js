import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

async function checkDatabase() {
    try {
        console.log('Connecting to:', uri.split('@')[1]); // Log host part only
        await mongoose.connect(uri);
        const db = mongoose.connection.db;

        console.log('--- Database Info ---');
        console.log('Connected DB Name:', mongoose.connection.name);

        const collections = await db.listCollections().toArray();
        console.log('Collections present:', collections.map(c => c.name));

        for (const col of collections) {
            if (col.name.toLowerCase().includes('customer')) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`Count in ${col.name}:`, count);

                const sanjai = await db.collection(col.name).findOne({ email: 'sanjaipandian.as@gmail.com' });
                if (sanjai) {
                    console.log(`FOUND user in ${col.name}:`, sanjai.email);
                } else {
                    console.log(`User NOT FOUND in ${col.name}`);
                }
            }
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error checking database:', err);
        process.exit(1);
    }
}

checkDatabase();
