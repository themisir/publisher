import { QueueEntry } from "../models/queue-entry";

export interface QueueRepository {
  getEntry(id: string): Promise<QueueEntry>;
}
