import { container, inject } from "tsyringe";
import UserModel from "../models/userModel";
import { injectable } from "tsyringe";
import { CreateUserDTO, RegisterUserDTO } from "../dtos/user-dto";
import PreferenceModel from "../models/preferenceModel";

@injectable()
export class UserController {
    public readonly model: UserModel
    public readonly preferenceModel: PreferenceModel

    constructor(
        @inject(UserModel.name) userModel: UserModel,
        @inject(PreferenceModel.name) preferenceModel: PreferenceModel
    ) {
        this.model = userModel
        this.preferenceModel = preferenceModel
    }


    public async getAllUsers(req, res) {
        console.log('users gotten')
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
            console.log('data', registerUserDto)
            let { preferenceCountry, preferenceLocation, preferenceLoveLanguage, preferenceLifestyle, preferenceType, ...user } = registerUserDto;

            // Step 1: Create user
            const newUser = await this.model.createUser(user);
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


    public async findUser(req, res) {
        const { id } = req.params
        const user = await this.model.findById(id)
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' })
        }
        return res.status(200).json({ status: true, message: "User retrieved successfully!", data: user })
    }
}

export const registerUserController = () => {
    container.register(UserController.name, { useClass: UserController })
}