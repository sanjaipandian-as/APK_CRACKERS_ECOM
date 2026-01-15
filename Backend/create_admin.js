import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

// Mock Admin Model for independent script
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" }
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function createAdmin() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: node create_admin.js <username> <password> [email]');
        process.exit(1);
    }

    const [username, password, email] = args;

    try {
        console.log('Connecting to database...');
        await mongoose.connect(uri);

        console.log(`Checking if username "${username}" exists...`);
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            console.error('Error: Username already exists.');
            await mongoose.disconnect();
            process.exit(1);
        }

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Creating admin user...');
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
            email: email || undefined
        });

        await newAdmin.save();
        console.log('--- Success ---');
        console.log(`Admin user "${username}" created successfully.`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin user:', err);
        process.exit(1);
    }
}

createAdmin();
