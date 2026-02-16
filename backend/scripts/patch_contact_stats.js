const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Contact = require('../src/models/Contact');

dotenv.config({ path: path.join(__dirname, '../.env') });

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const patchContacts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const contacts = await Contact.find({});
        console.log(`Found ${contacts.length} contacts to patch.`);

        const tags = ['Client', 'Vendor', 'Partner', 'Friend'];
        let updatedCount = 0;

        for (const contact of contacts) {
            // Randomly assign a tag if missing or empty
            if (!contact.tags || contact.tags.length === 0) {
                // Weighted selection: mostly Client (60%), then others
                const rand = Math.random();
                let tag = 'Client';
                if (rand > 0.6) tag = 'Vendor';
                if (rand > 0.8) tag = 'Partner';
                if (rand > 0.95) tag = 'Friend';
                
                contact.tags = [tag];
            }

            // Assign lastInteractionDate if missing
            if (!contact.lastInteractionDate) {
                // 40% chance of being recent (last 7 days)
                const isRecent = Math.random() < 0.4;
                const now = new Date();
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const threeYearsAgo = new Date(now.getTime() - 365 * 3 * 24 * 60 * 60 * 1000);

                if (isRecent) {
                    contact.lastInteractionDate = getRandomDate(sevenDaysAgo, now);
                } else {
                    contact.lastInteractionDate = getRandomDate(threeYearsAgo, sevenDaysAgo);
                }
            }

            await contact.save();
            updatedCount++;
            if (updatedCount % 100 === 0) process.stdout.write('.');
        }

        console.log(`\nSuccessfully patched ${updatedCount} contacts.`);
        process.exit(0);
    } catch (err) {
        console.error('Error patching contacts:', err);
        process.exit(1);
    }
};

patchContacts();
