export interface Message {
  nickname: string;
  clientId?: string;
  message: string;
  room: string;
  timestamp?: string;
}
