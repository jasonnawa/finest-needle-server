import { container, inject } from "tsyringe";
import UserModel from "../models/userModel";
import { injectable } from "tsyringe";
import { CreateUserDTO, RegisterUserDTO } from "../dtos/user-dto";
import PreferenceModel from "../models/preferenceModel";
import cron from 'node-cron';

@injectable()
export class UserController {
    public readonly model: UserModel
    public readonly preferenceModel: PreferenceModel

    constructor(
        @inject(UserModel.name) userModel: UserModel,
        @inject(PreferenceModel.name) preferenceModel: PreferenceModel,
    ) {
        this.model = userModel
        this.preferenceModel = preferenceModel
    }


    public async getAllUsers(req, res) {
       const allUsers = await this.model.findAll()

       if(!allUsers){
        return res.status(400).json({ status: false, message: 'Error fetching users' })
       }

        // Convert image buffer to Base64 for each user
    const usersWithBase64 = allUsers.map((user) => ({
        ...user,
        profileImage: user.profileImage?.data
          ? `data:${user.profileImage.contentType};base64,${user.profileImage.data.toString('base64')}`
          : null,
      }));

       return res.status(200).json({ status: true, message: 'Users fetched successfully' , data: usersWithBase64 })
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
            console.log('req.file', req.file);

            const registerUserDto: RegisterUserDTO = req.body;
            const profileImage = req.file ? {
                data: req.file.buffer,
                contentType: req.file.mimetype,
              }
            : undefined;

            console.log('data', registerUserDto)
            let { preferenceCountry, preferenceLocation, preferenceLoveLanguage, preferenceLifestyle, preferenceType, ...user } = registerUserDto;

            // Step 1: Create user
            const newUser = await this.model.createUser({...user, profileImage});
            if (!newUser) {
                return res.status(400).json({ status: false, message: 'Error registering user' });
            }

            // Step 2: Create preference
            const newPreference = await this.preferenceModel.createPreference({ preferenceCountry, preferenceLocation, preferenceLoveLanguage, preferenceLifestyle, preferenceType, });
            if (!newPreference) {
                // Rollback: optionally delete created user
                await this.model.deleteUser(newUser._id);
                return res.status(400).json({ status: false, message: 'Error creating preference' });
            }

            const plainUser = newUser.toObject ? newUser.toObject() : { ...newUser };
            const updatedUser = await this.model.updateUser({
                ...plainUser,
                preference: newPreference._id,
            });

            if (!updatedUser) {
                // Rollback both?
                await this.model.deleteUser(newUser._id);
                await this.preferenceModel.deletePreference(newPreference._id);
                return res.status(400).json({ status: false, message: 'An error occurred while updating user' });
            }

            return res.status(200).json({
                status: true,
                message: 'Successfully registered user',
                data: updatedUser,
            });
        } catch (error) {
            console.error('Registration Error:', error);
            return res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    }

    public async updateUserToPaid(userId: string, status){
        try{
        const updatedUser = await this.model.updateUser({_id:userId, paymentStatus: status})
        return !!updatedUser
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
      }
    }

    public async updateUserMatchStatus(userId: string, status){
        try{
        const updatedUser = await this.model.updateUser({_id:userId, isMatched: status})
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
}

export const registerUserControllerDI = () => {
    container.register(UserController.name, { useClass: UserController })
}