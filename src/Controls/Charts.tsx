import React from 'react';
import Grid from '@mui/material/Grid';
import { Line, Bar } from 'react-chartjs-2';
import Card from '@mui/material/Card';
import Draggable from 'react-draggable';

class ChartsProperties {
  public charts?: { [lookup: string]: ChartState };
}

class ChartsState {}

export class ChartState {
  public Datasets: any[];

  public Labels: string[];

  public Lookup!: string;

  public Name!: string;

  constructor() {
    this.Datasets = [];

    this.Labels = [];
  }
}

export default class Charts extends React.Component<
  ChartsProperties,
  ChartsState
> {
  //#region Constants
  //#endregion

  //#region Fields
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructors
  constructor(props: ChartsProperties) {
    super(props);

    this.state = {
      ...new ChartsState(),
    };
  }
  //#endregion

  //#region Life Cycle
  public componentDidMount() {}

  public render() {
    const chartKeys = Object.keys(this.props.charts || []);

    const datas = chartKeys.map((chartKey) => {
      const chart = (this.props.charts || {})[chartKey];

      return {
        // id: chart.Lookup,
        labels: chart.Labels,
        datasets: chart.Datasets,
      };
    });

    console.log(datas);

    return datas?.length > 0 ? (
      <Grid container spacing={2}>
        {datas.map((data, i) => {
          //console.log(data.datasets[0].chartType);
          if (data.datasets[0].chartType === "Line" || !data.datasets[0].chartType) {
          return (
            <Grid xs={12} md={6} item={true} key={i}>
              <Card>
                <Line datasetIdKey="id" data={data} options={data.datasets[0].options} />
              </Card>
            </Grid>
          ); }
          if (data.datasets[0].chartType === "Bar") {
            return (
              <Grid xs={12} md={6} item={true} key={i}>
                <Card>
                  <Bar datasetIdKey="id" data={data} options={data.datasets[0].options} />
                </Card>
              </Grid>
          ); }

          const dataLength = data.datasets[0].data.length - 1

          if (data.datasets[0].label === "tempf" && data.datasets[0].data[dataLength].y >= 70) {
            return (
              <Grid xs={12} md={6} item={true} key={i}>
                <Card>
                  <div id="human">
                    <Draggable>
                      <div id="tempSensor">
                        <img src="icons/tempHot.svg" alt="tempHot"/>
                        {data.datasets[0].data[dataLength].x} <br />
                        {data.datasets[0].data[dataLength].y}
                      </div>
                    </Draggable>
                  </div>
                </Card>
              </Grid>
          ); }
          if (data.datasets[0].label === "tempf" && data.datasets[0].data[dataLength].y < 70) {
            return (
              <Grid xs={12} md={6} item={true} key={i}>
                <Card>
                  <div id="human">
                    <Draggable>
                      <div id="tempSensor">
                        <img src="icons/tempCold.svg" alt="tempCold"/>
                        {data.datasets[0].data[dataLength].x} <br />
                        {data.datasets[0].data[dataLength].y}
                      </div>
                    </Draggable>
                  </div>
                </Card>
              </Grid>
          ); }

          if (data.datasets[0].chartType === "Building" && data.datasets[0].label === "motion" && data.datasets[0].data[dataLength].y === 0) {
            return (
              <Grid xs={12} md={12} item={true} key={i}>
                <Card>
                  <div id="building">
                    <Draggable>
                      <div id="motionSensor">
                        <img src="icons/motionNotDetected.svg" alt="motionNotDetected"/>
                        {data.datasets[0].data[dataLength].x} <br />
                        No Motion Detected
                      </div>
                    </Draggable>
                  </div>
                </Card>
              </Grid>
          ); }
          if (data.datasets[0].chartType === "Building" && data.datasets[0].label === "motion" && data.datasets[0].data[dataLength].y === 1) {
            return (
              <Grid xs={12} md={12} item={true} key={i}>
                <Card>
                  <div id="building">
                    <Draggable>
                      <div id="motionSensor">
                        <img src="icons/motionDetected.svg" alt="motionDetected"/>
                        {data.datasets[0].data[dataLength].x} <br />
                        Motion Detected!
                      </div>
                    </Draggable>
                  </div>
                </Card>
              </Grid>
          ); }
        })}
      </Grid>
    ) : (
      'Loading...'
    );
  }
  //#endregion

  //#region API Methods
  //#endregion

  //#region Helpers
  //#endregion
}
