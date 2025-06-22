import { container, inject } from "tsyringe";
import MatchModel from "../models/matchModel";
import { injectable } from "tsyringe";
import { CreateMatchDTO } from "../dtos/match-dto";

@injectable()
export class MatchController {
    public readonly model: MatchModel

    constructor(
        @inject(MatchModel.name) matchModel: MatchModel,
    ) {
        this.model = matchModel
    }


    public async getAllMatches(req, res) {
       const allMatches = await this.model.findAll()

       if(!allMatches){
        return res.status(400).json({ status: false, message: 'Error fetching matches'})
       }

       return res.status(200).json({ status: true, message: 'Matches fetched successfully' , data: allMatches })
    }

    public async createMatch(req, res) {
        const matchData: CreateMatchDTO = req.body
        
        if(matchData.userOne == matchData.userTwo){
            return res.status(400).json({ status: false, message: 'Cannot match same profile' })
        }

        if((await (this.model.findMatchByUsers(matchData.userOne, matchData.userTwo))).length > 0){
            return res.status(400).json({ status: false, message: 'Match already exists' })
        }

        const newMatch = await this.model.createMatch(matchData)
        if (!newMatch) {
            return res.status(400).json({ status: false, message: 'Error creating match' })
        }
        return res.status(200).json({ status: true, message: "Profiles matched successfully!", data: newMatch })
    }


}

export const registerMatchControllerDI = () => {
    container.register(MatchController.name, { useClass: MatchController })
}