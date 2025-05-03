import { 
  users, User, InsertUser, 
  worksites, Worksite, InsertWorksite,
  checkins, Checkin, InsertCheckin,
  verificationImages, VerificationImage, InsertVerificationImage
} from "@shared/schema";

// Extend the storage interface with our CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Worksite methods
  getWorksite(id: number): Promise<Worksite | undefined>;
  getAllWorksites(): Promise<Worksite[]>;
  createWorksite(worksite: InsertWorksite): Promise<Worksite>;
  updateWorksite(id: number, worksiteData: Partial<InsertWorksite>): Promise<Worksite | undefined>;
  
  // Check-in methods
  getCheckin(id: number): Promise<Checkin | undefined>;
  getCheckinsByUser(userId: number): Promise<Checkin[]>;
  getCheckinsByWorksite(worksiteId: number): Promise<Checkin[]>;
  getRecentCheckins(limit: number): Promise<Checkin[]>;
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  updateCheckinStatus(id: number, status: string): Promise<Checkin | undefined>;
  
  // Verification image methods
  getVerificationImage(id: number): Promise<VerificationImage | undefined>;
  getVerificationImagesByUser(userId: number): Promise<VerificationImage[]>;
  getRecentVerificationImages(limit: number): Promise<VerificationImage[]>;
  createVerificationImage(verificationImage: InsertVerificationImage): Promise<VerificationImage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private worksites: Map<number, Worksite>;
  private checkins: Map<number, Checkin>;
  private verificationImages: Map<number, VerificationImage>;
  
  private userIdCounter: number;
  private worksiteIdCounter: number;
  private checkinIdCounter: number;
  private verificationImageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.worksites = new Map();
    this.checkins = new Map();
    this.verificationImages = new Map();
    
    this.userIdCounter = 1;
    this.worksiteIdCounter = 1;
    this.checkinIdCounter = 1;
    this.verificationImageIdCounter = 1;
    
    // Add some sample data for development
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Worksite methods
  async getWorksite(id: number): Promise<Worksite | undefined> {
    return this.worksites.get(id);
  }

  async getAllWorksites(): Promise<Worksite[]> {
    return Array.from(this.worksites.values());
  }

  async createWorksite(insertWorksite: InsertWorksite): Promise<Worksite> {
    const id = this.worksiteIdCounter++;
    const worksite: Worksite = { ...insertWorksite, id };
    this.worksites.set(id, worksite);
    return worksite;
  }

  async updateWorksite(id: number, worksiteData: Partial<InsertWorksite>): Promise<Worksite | undefined> {
    const worksite = this.worksites.get(id);
    if (!worksite) return undefined;
    
    const updatedWorksite: Worksite = { ...worksite, ...worksiteData };
    this.worksites.set(id, updatedWorksite);
    return updatedWorksite;
  }

  // Check-in methods
  async getCheckin(id: number): Promise<Checkin | undefined> {
    return this.checkins.get(id);
  }

  async getCheckinsByUser(userId: number): Promise<Checkin[]> {
    return Array.from(this.checkins.values()).filter(
      (checkin) => checkin.userId === userId
    );
  }

  async getCheckinsByWorksite(worksiteId: number): Promise<Checkin[]> {
    return Array.from(this.checkins.values()).filter(
      (checkin) => checkin.worksiteId === worksiteId
    );
  }
  
  async getRecentCheckins(limit: number): Promise<Checkin[]> {
    return Array.from(this.checkins.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createCheckin(insertCheckin: InsertCheckin): Promise<Checkin> {
    const id = this.checkinIdCounter++;
    const timestamp = new Date();
    const checkin: Checkin = { ...insertCheckin, id, timestamp };
    this.checkins.set(id, checkin);
    return checkin;
  }

  async updateCheckinStatus(id: number, status: string): Promise<Checkin | undefined> {
    const checkin = this.checkins.get(id);
    if (!checkin) return undefined;
    
    const updatedCheckin: Checkin = { ...checkin, status };
    this.checkins.set(id, updatedCheckin);
    return updatedCheckin;
  }

  // Verification image methods
  async getVerificationImage(id: number): Promise<VerificationImage | undefined> {
    return this.verificationImages.get(id);
  }

  async getVerificationImagesByUser(userId: number): Promise<VerificationImage[]> {
    return Array.from(this.verificationImages.values()).filter(
      (verificationImage) => verificationImage.userId === userId
    );
  }
  
  async getRecentVerificationImages(limit: number): Promise<VerificationImage[]> {
    return Array.from(this.verificationImages.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createVerificationImage(insertVerificationImage: InsertVerificationImage): Promise<VerificationImage> {
    const id = this.verificationImageIdCounter++;
    const timestamp = new Date();
    const verificationImage: VerificationImage = { ...insertVerificationImage, id, timestamp };
    this.verificationImages.set(id, verificationImage);
    return verificationImage;
  }

  private initializeData() {
    // Create admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      fullName: "Admin User",
      email: "admin@worktrack.com",
      role: "admin",
      active: true,
    };
    this.createUser(adminUser);

    // Create some sample worksites
    const sampleWorksites: InsertWorksite[] = [
      {
        name: "Main Construction Site",
        address: "123 Main Street, City Center",
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 100,
        active: true,
      },
      {
        name: "Downtown Project",
        address: "456 Park Avenue, Downtown",
        latitude: 40.7580,
        longitude: -73.9855,
        radius: 100,
        active: true,
      },
      {
        name: "Riverside Construction",
        address: "789 Riverside Drive",
        latitude: 40.8296,
        longitude: -73.9570,
        radius: 100,
        active: true,
      },
      {
        name: "North Site",
        address: "321 North Boulevard",
        latitude: 40.7831,
        longitude: -73.9712,
        radius: 100,
        active: true,
      },
      {
        name: "East End Project",
        address: "555 East End Avenue",
        latitude: 40.7761,
        longitude: -73.9494,
        radius: 100,
        active: true,
      },
    ];

    sampleWorksites.forEach((worksite) => this.createWorksite(worksite));
  }
}

export const storage = new MemStorage();
