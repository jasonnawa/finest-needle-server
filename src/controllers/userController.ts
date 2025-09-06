import { container, inject } from "tsyringe";
import UserModel from "../models/userModel";
import { injectable } from "tsyringe";
import { CreateUserDTO, RegisterUserDTO } from "../dtos/user-dto";
import PreferenceModel from "../models/preferenceModel";
import cron from 'node-cron';
import sharp from 'sharp';
import { EnvConfiguration } from "../utils";
import { PaymentStatus } from "../enums/user-enums";
import { NotificationService } from "../utils/messaging";

@injectable()
export class UserController {
  public readonly model: UserModel
  public readonly preferenceModel: PreferenceModel
  private readonly envConfiguration: EnvConfiguration
  private readonly notificationService: NotificationService

  constructor(
    @inject(UserModel.name) userModel: UserModel,
    @inject(PreferenceModel.name) preferenceModel: PreferenceModel,
    @inject(EnvConfiguration.name) envConfiguration: EnvConfiguration
  ) {
    this.model = userModel
    this.preferenceModel = preferenceModel
    this.envConfiguration = envConfiguration
    this.notificationService = new NotificationService()
  }


  public async getAllUsers(req, res) {
    const allUsers = await this.model.findAll()

    if (!allUsers) {
      return res.status(400).json({ status: false, message: 'Error fetching users' })
    }

    // Convert image buffer to Base64 for each user
    const usersWithBase64 = allUsers.map((user) => ({
      ...user,
      profileImage: user.profileImage?.data
        ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
        : null,
    }));

    return res.status(200).json({ status: true, message: 'Users fetched successfully', data: usersWithBase64 })
  }

  public async getPendingUsers(req, res) {
    const allUsers = await this.model.findAllUnpaid()

    if (!allUsers) {
      return res.status(400).json({ status: false, message: 'Error fetching users' })
    }

    // Convert image buffer to Base64 for each user
    const usersWithBase64 = allUsers.map((user) => ({
      ...user,
      profileImage: user.profileImage?.data
        ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
        : null,
    }));

    return res.status(200).json({ status: true, message: 'Pending users fetched successfully', data: usersWithBase64 })
  }

  public async updateUserToPaidEndpoint(req, res) {
    const { id } = req.params;

    try {
      const user = await this.model.findById(id);

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }
      const updatedUser = await this.model.updateUser({
        _id: id,
        paymentStatus: PaymentStatus.PAID,
      });

      if (!updatedUser) {
        return res.status(400).json({
          status: false,
          message: "Failed to update user",
        });
      }

      await this.notificationService.sendEmail(updatedUser.email, 'Payment Received', 
        'Thank you for choosing Finest Needle. Your payment for user registration has been received.')

      return res.status(200).json({
        status: true,
        message: "User marked as paid successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }


  public async createUser(req, res) {
    const userData: CreateUserDTO = req.body
    const newUser = await this.model.createUser(userData)
    if (!newUser) {
      return res.status(400).json({ status: false, message: 'Error creating user' })
    }
    return res.status(200).json({ status: true, message: "User created successfully!", data: newUser })
  }

  public async registerUser(req, res) {
    try {
      const registerUserDto: RegisterUserDTO = req.body;

      let profileImage;
      if (req.file) {
        // • Resize to max width of 800px, compress to 80% quality JPEG
        const optimizedBuffer = await sharp(req.file.buffer)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        profileImage = {
          data: optimizedBuffer,
          contentType: 'image/jpeg',
        };
      }

      // Destructure out preference fields, leave the rest for user creation
      const {
        preferenceCountry,
        preferenceLocation,
        preferenceLoveLanguage,
        preferenceLifestyle,
        preferenceType,
        ...userFields
      } = registerUserDto;

      // Step 1: Create user + profileImage
      const newUser = await this.model.createUser({
        ...userFields,
        profileImage,
      });
      if (!newUser) {
        return res
          .status(400)
          .json({ status: false, message: 'Error registering user' });
      }

      // Step 2: Create preference
      const newPref = await this.preferenceModel.createPreference({
        preferenceCountry,
        preferenceLocation,
        preferenceLoveLanguage,
        preferenceLifestyle,
        preferenceType,
      });
      if (!newPref) {
        // Rollback
        await this.model.deleteUser(newUser._id);
        return res
          .status(400)
          .json({ status: false, message: 'Error creating preference' });
      }

      // Step 3: Attach preference to user
      const updated = await this.model.updateUser({
        ...newUser.toObject(),
        preference: newPref._id,
      });
      if (!updated) {
        // Rollback both
        await this.model.deleteUser(newUser._id);
        await this.preferenceModel.deletePreference(newPref._id);
        return res
          .status(400)
          .json({ status: false, message: 'Error updating user' });
      }

      return res.status(200).json({
        status: true,
        message: 'Successfully registered user',
        data: updated,
      });
    } catch (err) {
      console.error('Registration Error:', err);
      return res
        .status(500)
        .json({ status: false, message: 'Internal Server Error' });
    }
  }

  public async updateUserToPaid(userId: string, status) {
    try {
      const updatedUser = await this.model.updateUser({ _id: userId, paymentStatus: status })
      return !!updatedUser
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  public async updateUserMatchStatus(userId: string, status) {
    try {
      const updatedUser = await this.model.updateUser({ _id: userId, isMatched: status })
      return !!updatedUser
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  public async findUser(req, res) {
    const { id } = req.params
    const user = await this.model.findById(id)
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' })
    }
    return res.status(200).json({ status: true, message: "User retrieved successfully!", data: user })
  }

  public async deleteUnpaidUsers() {
    try {
      console.log('🧹 Starting unpaid user cleanup...');

      const result = await this.model.deleteManyUnpaidStatus();

      console.log(`✅ Deleted ${result.deletedCount} unpaid users.`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error deleting unpaid users:', error);
      return 0;
    }
  }

  public scheduleJob() {
    // Runs every 3 hours
    cron.schedule('0 */3 * * *', async () => {
      console.log('🕐 Running DeleteUnpaidUsersCron...');

      try {
        const deletedCount = await this.deleteUnpaidUsers();
        console.log(`✅ Deleted ${deletedCount} unpaid users`);
      } catch (error) {
        console.error('❌ Error running DeleteUnpaidUsersCron:', error);
      }
    });

    console.log('CRON: connected user cron...');
  }

  public siteUptimeMonitor() {
    // Runs every 4 minutes
    cron.schedule('*/4 * * * *', async () => {
      console.log('🔁 Running 4-minute site ping...');

      try {
        const response = await fetch(this.envConfiguration.BACKEND_API_URL);
        console.log(`✅ Ping successful: Status = ${response.status}`);
      } catch (error) {
        console.error('❌ Error pinging site:', error.message);
      }
    });

    console.log('🕓 CRON: Connected 4-minute site ping...');
  }

}

export const registerUserControllerDI = () => {
  container.register(UserController.name, { useClass: UserController })
}