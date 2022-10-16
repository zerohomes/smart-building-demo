import { debug } from 'console';
import React, { ChangeEvent } from 'react';
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
  BarElement,
} from 'chart.js';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';

class AppProperties {}

class AppState {
  public ChartStates: { [lookup: string]: ChartState };

  public CurrentDevice?: string;

  public DeviceChartStates: { [lookup: string]: ChartState };

  public Error?: string;

  public Location: {
    Data: any;
    Latitude: number;
    Longitude: number;
    Name: string;
  };

  public SelectedVariables: string[];

  public ChartPrefs: { [name: string]: any };

  public Variables: { [name: string]: any };

  constructor() {
    this.ChartStates = {};

    this.DeviceChartStates = {};

    this.Location = {
      Data: {},
      Latitude: 0,
      Longitude: 0,
      Name: 'Denver, CO',
    };

    this.SelectedVariables = [];

    this.ChartPrefs = {};

    this.Variables = {};
  }
}

export default class App extends React.Component<AppProperties, AppState> {
  //#region Constants
  //#endregion

  //#region Fields
  protected geocodioSvcUrl: string;

  protected geocodioQuery: string;

  protected habistackSvcUrl: string;

  protected iotSvcUrl: string;

  protected iotSvcQuery: string;

  protected pointsSvcQuery: string;

  protected refreshRate: number;
  
  protected refreshTimer: any;
  
  protected variablesSvcQuery: string;
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
      BarElement,
      Title,
      Tooltip,
      Legend
    );

    this.geocodioQuery = (window as any).LCU.State.GeocodioQuery;

    this.geocodioSvcUrl = (window as any).LCU.State.GeocodioAPIRoot;

    this.habistackSvcUrl = (window as any).LCU.State.HabistackAPIRoot;

    this.iotSvcQuery = (window as any).LCU.State.IoTAPIQuery;

    this.iotSvcUrl = (window as any).LCU.State.IoTAPIRoot;

    const defaultLocation = (window as any).LCU.State.Location;

    this.refreshRate = (window as any).LCU.State.RefreshRate || 30000;

    this.pointsSvcQuery = (window as any).LCU.State.PointAPIQuery;

    this.variablesSvcQuery = (window as any).LCU.State.VariablesAPIQuery;

    const selectedVars = (window as any).LCU.State.SelectedVariables || [
      'WindGust_Surface',
      'WindSpeed_10Meters',
      'WindDirection_10Meters',
      'PrecipitationRate_Surface',
      'TotalPrecipitation_Surface',
      'Temperature_Surface',
    ];

    const chartPrefs = (window as any).LCU.State.ChartPrefs;

    this.state = {
      ...new AppState(),
      SelectedVariables: selectedVars,
      ChartPrefs: chartPrefs,
      Location: {
        Data: {},
        Latitude: 0,
        Longitude: 0,
        Name: defaultLocation
      }
    };
  }
  //#endregion

  //#region Life Cycle
  public componentDidMount() {
    if (!this.refreshTimer) {
      this.loadVariablesData();
      this.loadIoTData();

      this.refreshTimer = setInterval(() => {
        this.loadCharts();
      }, this.refreshRate);
    }
  }

  public render() {
    const variableKeys = Object.keys(this.state.Variables);

    const variableOptions = variableKeys.map((key) => {
      const variable = this.state.Variables[key];

      return (
        <MenuItem key={key} value={key} title={variable.doc}>
          {variable.name} ({variable.level})
        </MenuItem>
      );
    });

    return (
      <div>
        {variableOptions?.length > 0 ? (
          <div>
            <div>
              <div>
                <Input
                  value={this.state.Location.Name}
                  onChange={(e) => this.onLocationChange(e)}
                ></Input>
              </div>

              <div>
                <Select<string[]>
                  multiple
                  value={this.state.SelectedVariables}
                  label="Variables"
                  input={
                    <OutlinedInput id="select-multiple-chip" label="Chip" />
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value: any) => (
                        <Chip
                          key={value}
                          label={`${this.state.Variables[value].name} (${this.state.Variables[value].level})`}
                        />
                      ))}
                    </Box>
                  )}
                  onChange={(e) => this.onVariableChange(e)}
                >
                  {variableOptions}
                </Select>

                <Button onClick={(e) => this.geocode()}>Load Forecast</Button>
              </div>

              <div>
                <Charts charts={this.state.ChartStates}></Charts>
              </div>
            </div>

            <div>
              <Charts charts={this.state.DeviceChartStates}></Charts>
            </div>
          </div>
        ) : (
          'Loading...'
        )}

        <div>{JSON.stringify(this.state.Error, null, 4)}</div>
      </div>
    );
  }
  //#endregion

  //#region API Methods
  //#endregion

  //#region Helpers
  protected geocode(): void {
    const location = encodeURIComponent(this.state.Location.Name);

    const geocodeApi = `${this.geocodioSvcUrl}${this.geocodioQuery}?q=${location}`;

    fetch(geocodeApi)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState(
            {
              Location: {
                Data: result,
                Name: result.results[0].formatted_address,
                Latitude: result.results[0].location.lat,
                Longitude: result.results[0].location.lng,
              },
              Error: undefined,
            },
            () => {
              this.loadCharts();
            }
          );
        },
        (error) => {
          console.log(error);

          this.setState({
            Error: error,
          });
        }
      );
  }

  protected loadCharts(): void {
    const variables: any[] = this.state.SelectedVariables.map((sv) => {
      const variable = this.state.Variables[sv];

      return {
        name: variable.name,
        level: variable.level,
      };
    });

    const hourSeconds = 3600;

    const hours = 24;

    let pointSeconds = Array.apply(null, Array(hours));

    pointSeconds = pointSeconds.map((v, i) => {
      return hourSeconds * i;
    });

    console.log(pointSeconds);

    const points: any[] = pointSeconds.map((ps) => {
      return {
        lat: this.state.Location.Latitude,
        lng: this.state.Location.Longitude,
        'relative-seconds': ps,
      };
    });

    this.loadPointsData(variables, points);
  }

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

            sensorReadings.forEach((srKey) => {
              if (!newDr[payload.DeviceID][srKey]) {
                newDr[payload.DeviceID][srKey] = new ChartState();

                newDr[payload.DeviceID][srKey].Datasets = [
                  {
                    id: 1,
                    label: srKey,
                    data: [],
                  },
                ];
              }

              const date = new Date(Date.parse(payload?.EventProcessedUtcTime));
              // const date = new Date(Date.parse(payload?.Timestamp));

              newDr[payload.DeviceID][srKey].Datasets[0].data.unshift({
                x: date.toLocaleString(),
                y: payload?.SensorReadings[srKey],
              });

              //Set IoT Chart Preferences
              const currentChartPref = this.state.ChartPrefs.find((e: any) => e.Name === newDr[payload.DeviceID][srKey].Datasets[0].label);
              
              if(currentChartPref != undefined) {
                newDr[payload.DeviceID][srKey].Datasets[0].backgroundColor = currentChartPref?.BackgroundColor;
                newDr[payload.DeviceID][srKey].Datasets[0].borderColor = currentChartPref?.BorderColor;
                newDr[payload.DeviceID][srKey].Datasets[0].chartType = currentChartPref?.ChartType;
              }
              
            });

            return newDr;
          }, {});

          const deviceIds = Object.keys(devicesReadingcharts);

          const curDevice = deviceIds[0];

          this.setState({
            CurrentDevice: curDevice,
            DeviceChartStates: devicesReadingcharts[curDevice],
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

  protected loadPointsData(variables: any[], points: any[]): void {
    // const pointsApi = 'https://fathym-cloud-prd.azure-api.net/habistack/weather/ground/api/v0/point-query';
    const pointsApi = `${this.habistackSvcUrl}${this.pointsSvcQuery}`;

    fetch(pointsApi, {
      method: 'POST',
      // mode: 'no-cors',
      headers: {
        'lcu-subscription-key': '0e367dfc37794b56b3a59ca41e927649',
      },
      body: JSON.stringify({
        variables: variables,
        points: points,
      }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          const variableResults = result as any[];

          const variableCharts = variableResults.reduce(
            (vc, variableResult, i) => {
              const newVc = {
                ...vc,
              };

              const variableKey = `${variableResult.name}_${variableResult.level}`;

              if (!newVc[variableKey]) {
                newVc[variableKey] = new ChartState();
              }

              newVc[variableKey].Datasets = [
                {
                  id: 1,
                  label: `${variableResult.name} (${variableResult.level})`,
                  data: variableResult.values.map((value: any, i: number) => {
                    return {
                      x: i > 0 ? `${i}hr` : 'Now',
                      y: value,
                    };
                  }),
                },
              ];

              return newVc;
            },
            {}
          );

          this.setState({
            ChartStates: variableCharts,
            Error: undefined,
          });
        },
        (error) => {
          console.log(error);

          this.setState({
            Error: error,
          });
        }
      );
  }

  protected loadVariablesData(): void {
    const variablesApi = `${this.habistackSvcUrl}${this.variablesSvcQuery}`;

    fetch(variablesApi)
      .then((res) => res.json())
      .then(
        (result) => {
          const variables = result as any[];

          const variableOptions = variables.reduce((vars, variable, i) => {
            const newVar = {
              ...vars,
            };

            const variableKey = `${variable.name}_${variable.level}`;

            if (!newVar[variableKey]) {
              newVar[variableKey] = {};
            }

            newVar[variableKey].name = variable.name;

            newVar[variableKey].doc = variable.doc;

            newVar[variableKey].level = variable.level;

            newVar[variableKey].units = variable.units;

            return newVar;
          }, {});

          this.setState(
            {
              // CurrentDevice: curDevice,
              Variables: variableOptions,
              Error: undefined,
            },
            () => {
              this.geocode();
            }
          );
        },
        (error) => {
          console.log(error);

          this.setState({
            Error: error,
          });
        }
      );
  }

  protected onLocationChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    this.setState({
      Location: {
        ...this.state.Location,
        Name: event.target.value,
      },
    });
  }

  protected onVariableChange(event: SelectChangeEvent<string[]>): void {
    const selectedVariables = event.target.value as string[];

    this.setState({
      SelectedVariables: selectedVariables,
    });
  }
  //#endregion
}
