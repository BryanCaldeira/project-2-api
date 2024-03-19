import { Request, Response } from "express";
import HarvestLog from "../models/HarvestLog";
import SeasonSchema from "../models/Season";
import Message from "../shared/Message";

const message = new Message("dashboard");

async function getHarvestData(seasonId: any) {
  try {
    const season: any = await SeasonSchema.findOne({
      _id: seasonId,
      deletedAt: null,
      status: "ACTIVE",
    }).populate(["product", "unit", "currency", "startDate"]);

    if (!season) {
      throw new Error("Season not found");
    }

    const data = await HarvestLog.find({
      deletedAt: null,
      season: season?._id,
    })
      .populate("picker")
      .exec();

    let totalHarvest = 0;
    let harvestDays = 0;
    let todaysHarvest = 0;
    //   let totalPayroll = 0;

    const today = new Date().setHours(0, 0, 0, 0);

    console.log(today);

    data.forEach((harvestLog: any) => {
      if (harvestLog.createdAt > today) {
        todaysHarvest += harvestLog.collectedAmount;
      }
      totalHarvest += harvestLog.collectedAmount;

      if (harvestLog.createdAt > season?.startDate) {
        harvestDays++;
      }
    });

    return {
      season: {
        id: season?._id,
        name: season?.name,
        startDate: season?.startDate,
        product: season?.product,
        unit: season?.unit,
        currency: season?.currency,
        price: season?.price,
      },
      totals: {
        totalHarvest,
        harvestDays,
        todaysHarvest,
        //   totalPayroll,
      },
    };
  } catch (error) {
    throw error;
  }
}

const getBySeasonId = async (req: Request, res: Response) => {
  try {
    const seasonId = req.params.id;

    const data = await getHarvestData(seasonId);

    return res.status(200).json({
      data,
      error: false,
      message: message.get("success"),
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      data: null,
      error: true,
      message: message.get("error"),
    });
  }
};

const dashboardController = {
  getBySeasonId,
};

export default dashboardController;
