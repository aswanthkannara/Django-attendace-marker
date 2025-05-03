import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertWorksiteSchema, insertCheckinSchema, insertVerificationImageSchema, checkInSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(validatedData.username);
      
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real app, you would create a session or JWT token here
      // For simplicity, just return the user without the password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users", async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Worksite routes
  app.get("/api/worksites", async (_req: Request, res: Response) => {
    try {
      const worksites = await storage.getAllWorksites();
      return res.status(200).json(worksites);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/worksites", async (req: Request, res: Response) => {
    try {
      const validatedData = insertWorksiteSchema.parse(req.body);
      const worksite = await storage.createWorksite(validatedData);
      
      return res.status(201).json(worksite);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check-in routes
  app.post("/api/checkins", async (req: Request, res: Response) => {
    try {
      const validatedData = checkInSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUser(validatedData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if worksite exists
      const worksite = await storage.getWorksite(validatedData.worksiteId);
      if (!worksite) {
        return res.status(404).json({ message: "Worksite not found" });
      }
      
      // Calculate if user is on-site (within worksite radius)
      const distance = calculateDistance(
        validatedData.latitude, 
        validatedData.longitude,
        worksite.latitude,
        worksite.longitude
      );
      
      const isOnsite = distance <= worksite.radius;
      
      let verificationImageId: number | undefined = undefined;
      
      // If imageData is provided, create a verification image
      if (validatedData.imageData) {
        const verificationImage = await storage.createVerificationImage({
          userId: validatedData.userId,
          worksiteId: validatedData.worksiteId,
          imageData: validatedData.imageData,
        });
        
        verificationImageId = verificationImage.id;
      }
      
      // Create check-in
      const checkin = await storage.createCheckin({
        userId: validatedData.userId,
        worksiteId: validatedData.worksiteId,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        verificationImageId,
        status: "pending",
        isOnsite,
        notes: isOnsite ? "Automatically verified by location" : "Location outside worksite boundary",
      });
      
      return res.status(201).json(checkin);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/checkins/recent", async (_req: Request, res: Response) => {
    try {
      const limit = parseInt(_req.query.limit as string) || 10;
      const checkins = await storage.getRecentCheckins(limit);
      
      // Enrich the checkin data with user and worksite info
      const enrichedCheckins = await Promise.all(
        checkins.map(async (checkin) => {
          const user = await storage.getUser(checkin.userId);
          const worksite = await storage.getWorksite(checkin.worksiteId);
          
          return {
            ...checkin,
            user: user ? { id: user.id, fullName: user.fullName, profileImage: user.profileImage } : null,
            worksite: worksite ? { id: worksite.id, name: worksite.name } : null,
          };
        })
      );
      
      return res.status(200).json(enrichedCheckins);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verification Image routes
  app.get("/api/verification-images/recent", async (_req: Request, res: Response) => {
    try {
      const limit = parseInt(_req.query.limit as string) || 10;
      const verificationImages = await storage.getRecentVerificationImages(limit);
      
      // Enrich the verification image data with user and worksite info
      const enrichedImages = await Promise.all(
        verificationImages.map(async (image) => {
          const user = await storage.getUser(image.userId);
          const worksite = await storage.getWorksite(image.worksiteId);
          
          return {
            ...image,
            user: user ? { id: user.id, fullName: user.fullName } : null,
            worksite: worksite ? { id: worksite.id, name: worksite.name } : null,
          };
        })
      );
      
      return res.status(200).json(enrichedImages);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const worksites = await storage.getAllWorksites();
      const recentCheckins = await storage.getRecentCheckins(50);
      
      // Get active employees (those with check-ins today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeEmployees = recentCheckins
        .filter(checkin => new Date(checkin.timestamp) >= today)
        .map(checkin => checkin.userId)
        .filter((userId, index, array) => array.indexOf(userId) === index);
      
      // Get off-site employees (those with check-ins today but not on-site)
      const offSiteEmployees = recentCheckins
        .filter(checkin => new Date(checkin.timestamp) >= today && !checkin.isOnsite)
        .map(checkin => checkin.userId)
        .filter((userId, index, array) => array.indexOf(userId) === index);
      
      // Get active worksites (those with check-ins today)
      const activeWorksites = recentCheckins
        .filter(checkin => new Date(checkin.timestamp) >= today)
        .map(checkin => checkin.worksiteId)
        .filter((siteId, index, array) => array.indexOf(siteId) === index);
      
      // Get pending verifications
      const pendingVerifications = recentCheckins
        .filter(checkin => checkin.status === "pending")
        .length;
      
      return res.status(200).json({
        activeEmployees: activeEmployees.length,
        offSiteEmployees: offSiteEmployees.length,
        activeWorksites: activeWorksites.length,
        pendingVerifications,
        totalEmployees: users.filter(user => user.role === "employee").length,
        totalWorksites: worksites.length,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate distance between two points in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
