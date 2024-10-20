import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Withdrawal from '../models/withdrawalModel.js';

dotenv.config();

const migrateWithdrawalFields = async () => {
  try {
    if (!process.env.DATABASE_URI) {
      throw new Error(
        'DATABASE_URI is not defined in the environment variables',
      );
    }

    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');

    const withdrawals = await Withdrawal.find();
    console.log(`Found ${withdrawals.length} withdrawals`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (let withdrawal of withdrawals) {
      let isUpdated = false;

      if (!withdrawal.withdrawalMethod && withdrawal.paymentMethod) {
        withdrawal.withdrawalMethod = withdrawal.paymentMethod;
        isUpdated = true;
      }

      if (
        !withdrawal.withdrawalMethodNumber &&
        withdrawal.paymentMethodNumber
      ) {
        withdrawal.withdrawalMethodNumber = withdrawal.paymentMethodNumber;
        isUpdated = true;
      }

      if (isUpdated) {
        try {
          await withdrawal.save();
          updatedCount++;
        } catch (saveError) {
          console.warn(
            `Failed to update withdrawal ${withdrawal._id}: ${saveError.message}`,
          );
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log(
      `Migration completed. Updated: ${updatedCount}, Skipped: ${skippedCount}`,
    );
  } catch (error) {
    console.error('Error migrating withdrawal fields:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

migrateWithdrawalFields().then(() => process.exit());
