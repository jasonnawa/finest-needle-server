import { injectable, container } from "tsyringe";
import mongoose, { Document, Schema, Model, ObjectId } from "mongoose";
import { CreateMatchDTO } from "../dtos/match-dto";
import { UserMongooseModel } from "./userModel";

interface IMatch extends Document {
  _id: ObjectId;
  userOne: ObjectId;
  userTwo: ObjectId;
}

const MatchSchema: Schema<IMatch> = new Schema<IMatch>(
  {
    userOne: { type: mongoose.Types.ObjectId, required: true, ref: UserMongooseModel },
    userTwo: { type: mongoose.Types.ObjectId, required: true, ref: UserMongooseModel },
  },
  {
    timestamps: true,
  }
);

const MatchMongooseModel: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);

@injectable()
export default class MatchModel {
    async findAll() {
        return await MatchMongooseModel.find()
          .populate([
            {
              path: "userOne",
              populate: { path: "preference" }
            },
            {
              path: "userTwo",
              populate: { path: "preference" }
            }
          ]);
      }
      
  async createMatch(data: CreateMatchDTO) {
    const match = new MatchMongooseModel(data);
    return await match.save();
  }

  async findMatchByUsers(userOneId: string, userTwoId: string) {
    return await MatchMongooseModel.find({
      $or: [
        { userOne: userOneId, userTwo: userTwoId },
        { userOne: userTwoId, userTwo: userOneId },
      ],
    });
  }

  async deleteMatch(id: string) {
    return await MatchMongooseModel.findByIdAndDelete(id);
  }

  public async deleteMatchByUsers(userOneId: string, userTwoId: string) {
    try {
      const result = await MatchMongooseModel.deleteOne({
        $or: [
          { userOne: userOneId, userTwo: userTwoId },
          { userOne: userTwoId, userTwo: userOneId },
        ],
      });
  
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting match:', error);
      return false;
    }
  }
  
}

export const registerMatchModelDI = () => {
  container.register(MatchModel.name, { useClass: MatchModel });
};
