import { ServerRespond } from './DataStreamer';

export interface Row {
  stock: string,
  top_ask_price: number,
  ratio: number, // Added ratio
  timestamp: Date,
}

export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row[] {
    return serverResponds.map((el: ServerRespond) => {
      return {
        stock: el.stock,
        top_ask_price: el.top_ask.price,
        ratio: el.top_ask.price / el.top_bid.price, // Calculate ratio
        timestamp: el.timestamp,
      };
    });
  }
}
