import { injectable, container } from "tsyringe";
import mongoose, { Document, Schema, Model, ObjectId } from "mongoose"
import { CreatePreferenceDTO } from "../dtos/preference-dto";

interface IPreference extends Document {
    _id: ObjectId,
    preferenceCountry: string;
    preferenceLocation: string;
    preferenceLoveLanguage: string;
    preferenceLifestyle: string;
    preferenceType: string;
}


const PreferenceSchema: Schema<IPreference> = new Schema<IPreference>({
    preferenceCountry: { type: String, required: false },
    preferenceLocation: { type: String, required: false },
    preferenceLoveLanguage: { type: String, required: false },
    preferenceLifestyle: { type: String, required: false },
    preferenceType: { type: String, required: false },
}, {
    timestamps: true
});

const PreferenceMongooseModel: Model<IPreference> =
    mongoose.models.Preference || mongoose.model<IPreference>("Preference", PreferenceSchema);


@injectable()
export default class PreferenceModel {
    async createPreference(data: CreatePreferenceDTO) {
        const preference = new PreferenceMongooseModel(data)
        return await preference.save()
    }

    async deletePreference(id) {
        return await PreferenceMongooseModel.findByIdAndDelete(id)
    }

}

export const registerPreferenceModelDI = () => {
    container.register(PreferenceModel.name, { useClass: PreferenceModel })
}
