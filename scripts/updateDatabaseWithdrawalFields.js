import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Withdrawal from '../models/withdrawalModel.js';

dotenv.config();

const updateDatabaseWithdrawalFields = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error(
        'DATABASE_URI is not defined in the environment variables',
      );
    }

    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');

    // Menggunakan aggregation pipeline untuk update
    const updateResult = await Withdrawal.updateMany(
      {}, // filter kosong untuk memilih semua dokumen
      [
        {
          $set: {
            withdrawalMethod: {
              $ifNull: ['$paymentMethod', '$withdrawalMethod'],
            },
            withdrawalMethodNumber: {
              $ifNull: ['$paymentMethodNumber', '$withdrawalMethodNumber'],
            },
          },
        },
        {
          $unset: ['paymentMethod', 'paymentMethodNumber'],
        },
      ],
    );

    console.log(`Updated ${updateResult.modifiedCount} documents`);
  } catch (error) {
    console.error('Error updating database fields:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

updateDatabaseWithdrawalFields().then(() => process.exit());
