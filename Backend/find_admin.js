import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

async function findAdmin() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(uri);
        const db = mongoose.connection.db;

        console.log('--- Searching for Admin Users ---');
        const adminCollection = db.collection('admins');
        const admins = await adminCollection.find({}).toArray();

        if (admins.length > 0) {
            console.log(`Found ${admins.length} total admin(s):`);
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. Username: "${admin.username}", Email: "${admin.email || 'N/A'}"`);
            });
        } else {
            console.log('No admin users found in the "admins" collection.');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error searching for admin users:', err);
        process.exit(1);
    }
}

findAdmin();
