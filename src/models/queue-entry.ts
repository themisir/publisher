export interface QueueEntry {
  id: string;
  receivedBy: string;
  status: string;
  message: any;
  result: any;
}
