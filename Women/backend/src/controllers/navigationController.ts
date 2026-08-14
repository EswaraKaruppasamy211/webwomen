import { Request, Response } from 'express';
import { z } from 'zod';
import { aiSafetyScorer } from '../services/aiSafetyScorer';
import { db } from '../db/database';

const RouteQuerySchema = z.object({
  startLat: z.number().min(-90).max(90),
  startLng: z.number().min(-180).max(180),
  destLat: z.number().min(-90).max(90),
  destLng: z.number().min(-180).max(180),
  destinationName: z.string().optional().default('Destination'),
  travelMode: z.enum(['WALKING', 'TRANSIT', 'DRIVING']).optional().default('WALKING'),
});

export class NavigationController {
  public async calculateRoutes(req: Request, res: Response): Promise<void> {
    try {
      const parsed = RouteQuerySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.errors[0].message });
        return;
      }

      const { startLat, startLng, destLat, destLng, travelMode } = parsed.data;

      const routes = aiSafetyScorer.calculateSafeRoutes({
        startLat,
        startLng,
        destLat,
        destLng,
        travelMode,
      });

      const safePlaces = db.getSafetyZones().filter((z) => z.type !== 'HIGH_RISK_ZONE');

      res.json({
        success: true,
        routes,
        safePlacesNearRoute: safePlaces,
        disclaimer:
          'SafeHer AI is a safety-support and navigation system. AI safety scores and location information are estimates and do not guarantee personal safety or emergency response. In an immediate emergency, contact your local emergency services.',
        evaluatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Route calculation failed:', err);
      res.status(500).json({ success: false, message: 'Failed to calculate safe route options.' });
    }
  }

  public async getSafePlaces(req: Request, res: Response): Promise<void> {
    try {
      const zones = db.getSafetyZones();
      res.json({
        success: true,
        safePlaces: zones,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve safe places.' });
    }
  }

  public async getHazardHeatmap(req: Request, res: Response): Promise<void> {
    try {
      const approvedReports = db.getApprovedReports();
      const highRiskZones = db.getSafetyZones().filter((z) => z.type === 'HIGH_RISK_ZONE');

      res.json({
        success: true,
        hazards: approvedReports,
        cautionZones: highRiskZones,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve hazard data.' });
    }
  }
}

export const navigationController = new NavigationController();
