import { db } from "./db";
import { games, type InsertGame, type Game } from "@shared/schema";

export interface IStorage {
  createGame(game: InsertGame): Promise<Game>;
  getGames(): Promise<Game[]>;
}

export class DatabaseStorage implements IStorage {
  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async getGames(): Promise<Game[]> {
    return await db.select().from(games);
  }
}

export const storage = new DatabaseStorage();
