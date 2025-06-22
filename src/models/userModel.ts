import { injectable, container } from "tsyringe";
import mongoose, { Document, Schema, Model, ObjectId } from "mongoose"
import { CreateUserDTO } from "../dtos/user-dto";
import { Gender } from "../enums/user-enums";
import { PreferenceMongooseModel } from "./preferenceModel";
interface IUser extends Document {
    firstName?: string;
    lastName?: string;
    email?: string;
    age?: number;
    gender?: Gender;
    phoneNumber?: string;
    country?: string;
    address?: string;
    location?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    religion?: string;
    relationshipGoals?: string;
    password?: string;
    preference?: ObjectId;
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    age: { type: Number },
    gender: { type: String, enum: Object.values(Gender) },
    phoneNumber: { type: String },
    country: { type: String },
    address: { type: String },
    location: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    religion: { type: String },
    relationshipGoals: { type: String },
    password: { type: String, required: false },
    preference: { type: mongoose.Types.ObjectId, required: false , ref: PreferenceMongooseModel}
}, {
    timestamps: true
});

export const UserMongooseModel: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


@injectable()
export default class UserModel {
    async createUser(data: CreateUserDTO) {
        const user = new UserMongooseModel(data)
        return await user.save()
    }

    async findByEmail(email: string) {
        return await UserMongooseModel.findOne({ email }).exec();
    }

    async findById(id: string) {
        return await UserMongooseModel.findById(id).exec();
    }

    async findAll(){
        return await UserMongooseModel.find().select("-password -__v").populate("preference").lean();
    }

    async updateUser(user: Partial<IUser>) {
        const { _id, ...updateData } = user;
        return await UserMongooseModel.findByIdAndUpdate(_id, updateData, { new: true })
    }

    async deleteUser(id) {
        return await UserMongooseModel.findByIdAndDelete(id)
    }

}

export const registerUserModelDI = () => {
    container.register(UserModel.name, { useClass: UserModel })
}
