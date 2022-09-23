import { debug } from 'console';
import React from 'react';
import Charts, { ChartState } from './Controls/Charts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

class AppProperties {}

class AppState {
  public Calculating: boolean;

  public ChartStates: { [lookup: string]: ChartState };

  public CurrentDevice?: string;

  public Error?: string;

  constructor() {
    this.Calculating = false;

    this.ChartStates = {};
  }
}

export default class App extends React.Component<AppProperties, AppState> {
  //#region Constants
  //#endregion

  //#region Fields
  protected iotSvcUrl: string;
  
  protected iotSvcQuery: string;
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructors
  constructor(props: AppProperties) {
    super(props);

    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    );
    
    this.iotSvcQuery = (window as any).LCU.State.APIQuery;
    
    this.iotSvcUrl = (window as any).LCU.State.APIRoot;

    this.state = {
      ...new AppState(),
    };
  }
  //#endregion

  //#region Life Cycle
  public componentDidMount() {
    this.loadIoTData();
  }

  public render() {
    return (
      <div>
        <Charts charts={this.state.ChartStates}></Charts>
      </div>
    );
  }
  //#endregion

  //#region API Methods
  //#endregion

  //#region Helpers
  protected loadIoTData(): void {
    const iotApi = `${this.iotSvcUrl}${this.iotSvcQuery}`;

    fetch(iotApi)
      .then((res) => res.json())
      .then(
        (result) => {
          const payloads = result.Payloads as any[];

          const devicesReadingcharts = payloads.reduce((dr, payload, i) => {
            const newDr = {
              ...dr,
            };

            if (!newDr[payload.DeviceID]) {
              newDr[payload.DeviceID] = {};
            }

            const sensorReadings = Object.keys(payload?.SensorReadings || {});

            sensorReadings.forEach(srKey => {
              if (!newDr[payload.DeviceID][srKey]) {
                newDr[payload.DeviceID][srKey] = new ChartState();

                newDr[payload.DeviceID][srKey].Datasets = [{
                  id: 1,
                  label: srKey,
                  data: []
                }];
              }
              
              const date = new Date(Date.parse(payload?.EventProcessedUtcTime));
              // const date = new Date(Date.parse(payload?.Timestamp));

              newDr[payload.DeviceID][srKey].Datasets[0].data.push({x: date.toLocaleString(), y: payload?.SensorReadings[srKey]});
            });

            return newDr;
          }, {});

          const deviceIds = Object.keys(devicesReadingcharts);

          const curDevice = deviceIds[0];

          this.setState({
            CurrentDevice: curDevice,
            ChartStates: devicesReadingcharts[curDevice],
            Error: undefined,
          });
        },
        (error) => {
          this.setState({
            Error: error,
          });
        }
      );
  }
  //#endregion
}
