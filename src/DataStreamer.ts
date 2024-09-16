export interface Order {
  price: number,
  size: number,
}

export interface ServerRespond {
  stock: string,
  top_bid: Order,
  top_ask: Order,
  timestamp: Date,
  ratio?: number, // Added optional ratio field
}

class DataStreamer {
  static API_URL: string = 'http://localhost:8080/query?id=1';

  static getData(callback: (data: ServerRespond[]) => void): void {
    const request = new XMLHttpRequest();
    request.open('GET', DataStreamer.API_URL, false);

    request.onload = () => {
      if (request.status === 200) {
        const data: ServerRespond[] = JSON.parse(request.responseText);

        // Add ratio calculation here
        const dataWithRatio = data.map(item => ({
          ...item,
          ratio: item.top_ask.price / item.top_bid.price // Calculate ratio
        }));

        callback(dataWithRatio);
      } else {
        alert('Request failed');
      }
    }

    request.send();
  }
}

export default DataStreamer;
