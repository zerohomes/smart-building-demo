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
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

class AppProperties {}

class AppState {
  public ChartStates: { [lookup: string]: ChartState };

  public Error?: string;

  public SelectedVariables: string[];

  public Variables: { [name: string]: any };

  constructor() {
    this.ChartStates = {};

    this.SelectedVariables = [];

    this.Variables = {};
  }
}

export default class App extends React.Component<AppProperties, AppState> {
  //#region Constants
  //#endregion

  //#region Fields
  protected habistackSvcUrl: string;

  protected pointsSvcQuery: string;

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
      Title,
      Tooltip,
      Legend
    );

    this.habistackSvcUrl = (window as any).LCU.State.APIRoot;

    this.pointsSvcQuery = (window as any).LCU.State.PointAPIQuery;

    this.variablesSvcQuery = (window as any).LCU.State.VariablesAPIQuery;

    this.state = {
      ...new AppState(),
      SelectedVariables: [
        'WindGust',
        'WindSpeed',
        'WindDirection',
        'PrecipitationRate',
        'TotalPrecipitation',
        'Temperature',
      ],
    };
  }
  //#endregion

  //#region Life Cycle
  public componentDidMount() {
    this.loadVariablesData();
  }

  public render() {
    const variableKeys = Object.keys(this.state.Variables);

    const variableOptions = variableKeys.map((key) => {
      const variable = this.state.Variables[key];

      return (
        <MenuItem key={key} value={key} title={variable.doc}>
          {key}
        </MenuItem>
      );
    });
    return (
      <div>
        <div>
          {true && (
            <Select<string[]>
              multiple
              value={this.state.SelectedVariables}
              label="Variables"
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value: any) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              onChange={(e) => this.onVariableChange(e)}
            >
              {variableOptions}
            </Select>
          )}
        </div>

        <div>
          <Button onClick={(e) => this.loadCharts()}>Load Charts</Button>
        </div>

        <div>
          <Charts charts={this.state.ChartStates}></Charts>{' '}
        </div>

        <div>{JSON.stringify(this.state.Error, null, 4)}</div>
      </div>
    );
  }
  //#endregion

  //#region API Methods
  //#endregion

  //#region Helpers
  protected loadCharts(): void {
    const variables: any[] = this.state.SelectedVariables.map((sv) => {
      return {
        name: sv,
        level: this.state.Variables[sv].level,
      };
    });

    const latLng = {
      lat: 32.784618,
      lng: -79.940918,
    };

    const hourSeconds = 3600;

    const pointSeconds = [
      0,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
      hourSeconds * 1,
    ];

    const points: any[] = pointSeconds.map((ps) => {
      return {
        ...latLng,
        'relative-seconds': ps,
      };
    });

    this.loadPointsData(variables, points);
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

              if (!newVc[variableResult.name]) {
                newVc[variableResult.name] = new ChartState();
              }

              newVc[variableResult.name].Datasets = [
                {
                  id: 1,
                  label: variableResult.name,
                  data: variableResult.values.map((value: any, i: number) => {
                    return {
                      x: i > 0 ? `${i}hr` : 'Now',
                      y: value 
                    }
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

            if (!newVar[variable.name]) {
              newVar[variable.name] = {};
            }

            newVar[variable.name].doc = variable.doc;

            newVar[variable.name].level = variable.level;

            newVar[variable.name].units = variable.units;

            return newVar;
          }, {});

          this.setState(
            {
              // CurrentDevice: curDevice,
              Variables: variableOptions,
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

  protected onVariableChange(event: SelectChangeEvent<string[]>): void {
    const selectedVariables = event.target.value as string[];

    this.setState({
      SelectedVariables: selectedVariables,
    });
  }
  //#endregion
}
