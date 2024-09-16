import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
  setAttribute: (name: string, value: string) => void,
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;
  historicalAverageRatio: number = 1.0; // Example historical average ratio
  upperBound: number = this.historicalAverageRatio * 1.10; // +10%
  lowerBound: number = this.historicalAverageRatio * 0.90; // -10%

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      ratio: 'float', // Added for the ratio
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('column-pivots', '["stock"]');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio"]');
      elem.setAttribute('aggregates', JSON.stringify({
        stock: 'distinctcount',
        ratio: 'avg',
        timestamp: 'distinct count',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update(
        DataManipulator.generateRow(this.props.data),
      );

      // Check for bounds and show alert if needed
      this.table.to_json().then((data) => {
        data.forEach(row => {
          if (row.ratio > this.upperBound || row.ratio < this.lowerBound) {
            this.showAlert("Alert: Ratio out of bounds!");
          }
        });
      });
    }
  }

  showAlert(message: string) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert';
    alertElement.textContent = message;
    document.body.appendChild(alertElement);

    // Remove the alert after a few seconds
    setTimeout(() => {
      document.body.removeChild(alertElement);
    }, 5000);
  }
}

export default Graph;
