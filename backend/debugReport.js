const mongoose = require('mongoose');
const Billing = require('./src/models/Billing');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Check if raw data exists
        const count = await Billing.countDocuments({});
        console.log('Total Billings in DB:', count);

        const sample = await Billing.findOne({});
        console.log('Sample Billing:', sample);

        if (sample) {
            console.log('Sample Billing Date:', sample.billingDate);
            console.log('Sample Billing Company:', sample.company);
        }

        // Test Aggregation Logic locally
        const year = 2026;
        const start = new Date(`${year}-01-01`);
        const end = new Date(`${year}-12-31`);

        const stats = await Billing.aggregate([
            {
                $match: {
                    billingDate: { $gte: start, $lte: end },
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: { $month: "$billingDate" },
                    revenue: { $sum: '$grandTotal' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        console.log('Aggregation Result (All Companies):', stats);

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

run();
