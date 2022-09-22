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
        <pre>{this.state.Error}</pre>

        <Charts charts={this.state.ChartStates}></Charts>
      </div>
    );
  }
  //#endregion

  //#region API Methods
  //#endregion

  //#region Helpers
  protected loadIoTData(): void {
    const calcApi = `${this.iotSvcUrl}/WarmQuery?includeEmulated=true&page=1&pageSize=25`;

    fetch(calcApi)
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
                  label: '',
                  data: []
                }];
              }
              
              newDr[payload.DeviceID][srKey].Datasets[0].data.push(payload?.SensorReadings[srKey]);
            });

            return newDr;
          }, {});

          const deviceIds = Object.keys(devicesReadingcharts);

          const curDevice = deviceIds[0];

          const err = JSON.stringify(devicesReadingcharts[curDevice]);

          this.setState({
            CurrentDevice: curDevice,
            ChartStates: devicesReadingcharts[curDevice],
            Error: err, //null,
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
