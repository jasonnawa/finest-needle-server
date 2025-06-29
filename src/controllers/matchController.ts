import { container, inject } from "tsyringe";
import MatchModel from "../models/matchModel";
import { injectable } from "tsyringe";
import { CreateMatchDTO } from "../dtos/match-dto";
import { UserController } from "./userController";

@injectable()
export class MatchController {
    public readonly model: MatchModel
    public readonly userController: UserController

    constructor(
        @inject(MatchModel.name) matchModel: MatchModel,
        @inject(UserController.name) userController: UserController
    ) {
        this.model = matchModel
        this.userController = userController
    }


    public async getAllMatches(req, res) {
        try {
          const allMatches = await this.model.findAll();
      
          if (!allMatches) {
            return res.status(400).json({ status: false, message: 'Error fetching matches' });
          }
      
          // For each match, convert user profile images to Base64
          const matchesWithImages = allMatches.map((match) => {
            const userOne = match.userOne as any;
            const userTwo = match.userTwo as any;
      
            const userOneImage = userOne?.profileImage?.data
              ? `data:${userOne.profileImage.contentType};base64,${userOne.profileImage.data.toString('base64')}`
              : null;
      
            const userTwoImage = userTwo?.profileImage?.data
              ? `data:${userTwo.profileImage.contentType};base64,${userTwo.profileImage.data.toString('base64')}`
              : null;
      
            return {
              ...match.toObject(),
              userOne: {
                ...userOne.toObject(),
                profileImage: userOneImage,
              },
              userTwo: {
                ...userTwo.toObject(),
                profileImage: userTwoImage,
              },
            };
          });
      
          return res.status(200).json({
            status: true,
            message: 'Matches fetched successfully',
            data: matchesWithImages,
          });
        } catch (error) {
          console.error('❌ Error fetching matches:', error);
          return res.status(500).json({ status: false, message: 'Server error' });
        }
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

        await Promise.all([
            this.userController.updateUserMatchStatus(matchData.userOne, true),
            this.userController.updateUserMatchStatus(matchData.userTwo, true),
          ]);          
        
        return res.status(200).json({ status: true, message: "Profiles matched successfully!", data: newMatch })
    }

    public async unmatch(req, res) {
        const { userOne, userTwo } = req.body;
      
        if (!userOne || !userTwo) {
          return res.status(400).json({ status: false, message: 'Both user IDs are required' });
        }
      
        try {
          // Check if match exists
          const existingMatches = await this.model.findMatchByUsers(userOne, userTwo);
      
          if (existingMatches.length === 0) {
            return res.status(404).json({ status: false, message: 'No existing match found between these users' });
          }
      
          // Delete the match (assuming there's only one match per user pair)
          const deleted = await this.model.deleteMatchByUsers(userOne, userTwo);
      
          if (!deleted) {
            return res.status(500).json({ status: false, message: 'Error deleting match' });
          }
      
          // Optionally, set both users' match status to false
          await Promise.all([
            this.userController.updateUserMatchStatus(userOne, false),
            this.userController.updateUserMatchStatus(userTwo, false),
          ]);
      
          return res.status(200).json({ status: true, message: 'Users unmatched successfully' });
        } catch (error) {
          console.error('❌ Error unmatching users:', error);
          return res.status(500).json({ status: false, message: 'Server error during unmatch' });
        }
      }
      


}

export const registerMatchControllerDI = () => {
    container.register(MatchController.name, { useClass: MatchController })
}