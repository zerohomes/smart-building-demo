import React from 'react';
import Grid from '@mui/material/Grid';
import CurrentIconCard from '../Components/CurrentIconCard';
import { TempIcon, WaterIcon, WindIcon } from '../Components/IotIcons';

class CurrentValsProperties {
  public currentvals?: { [lookup: string]: CurrentValState };

  public children?: React.ReactNode;
}

class CurrentValsState {}

export class CurrentValState {
  public Datasets: any[];

  public Labels: string[];

  public Lookup!: string;

  public Name!: string;

  constructor() {
    this.Datasets = [];

    this.Labels = [];
  }
}

export default class CurrentVals extends React.Component<
  CurrentValsProperties,
  CurrentValsState
> {
  //#region Constants
  //#endregion

  //#region Fields
  //#endregion

  //#region Properties
  //#endregion

  //#region Constructors
  constructor(props: CurrentValsProperties) {
    super(props);

    this.state = {
      ...new CurrentValsState(),
    };
  }
  //#endregion

  //#region Life Cycle
  public componentDidMount() {}

  public render() {
    const currentvalKeys = Object.keys(this.props.currentvals || []);

    const datas = currentvalKeys.map((currentvalKeys) => {
      const currentval = (this.props.currentvals || {})[currentvalKeys];

      return {
        // id: currentval.Lookup,
        labels: currentval.Labels,
        datasets: currentval.Datasets,
      };
    });

    console.log(datas);

    return datas?.length > 0 ? (
      <Grid container spacing={2} >
        {datas.map((data, i) => {
          //console.log(data.datasets[0].chartType);

          const tempIcon = <TempIcon sx={{ color:"magenta", width:"36px" }} />

          const dataLength = data.datasets[0].data.length - 1;

          if (
            data.datasets[0].displayCurrent
          ) {
            return (
              <>
              <Grid xs={12} md={3} item={true} key={i}>
                      {(data.datasets[0].label === 'Temperature' || data.datasets[0].label === 'Temperature (Surface)' || data.datasets[0].label === 'Temperature (2Meters)') ? 
                      <div>
                      {data.datasets[0].data[dataLength].y >= 70 ?
                        <CurrentIconCard icon={tempIcon} title={(data.datasets[0].data[0].y)} content={data.datasets[0].label} unit={data.datasets[0].displayUnits} />
                      : <CurrentIconCard icon={tempIcon} title={(data.datasets[0].data[0].y)} content={data.datasets[0].label} unit={data.datasets[0].displayUnits} />
                      }
                      </div>
                      : data.datasets[0].label === 'Occupied' ? //&& data.datasets[0].label === 'motion') ?
                      <div>
                        <div>
                          {data.datasets[0].data[dataLength].y === 0 ?
                            <div>
                            <img
                              src="icons/motionNotDetected.svg"
                              alt="motionNotDetected"
                            />
                            No Motion Detected <br />
                            {data.datasets[0].data[dataLength].x}
                            </div>
                          : <div>
                            <img
                              src="icons/motionDetected.svg"
                              alt="motionDetected"
                            />
                            Motion Detected! <br />
                            {data.datasets[0].data[dataLength].x}
                            </div>
                          }
                        </div>
                      </div>
                      : data.datasets[0].label === 'Humidity' ?
                        <div>
                          <CurrentIconCard icon={<WaterIcon sx={{ color:"blue", width:"36px" }} />} title={data.datasets[0].data[0].y} content={data.datasets[0].label} unit="%" />
                        </div>
                      : data.datasets[0].label === 'WindGust (Surface)' ?
                        <div>
                          <CurrentIconCard icon={<WindIcon sx={{ color:"green", width:"36px" }} />} title={data.datasets[0].data[0].y} content={data.datasets[0].label} unit="mph" />
                        </div>
                      : <CurrentIconCard icon={<WindIcon sx={{ color:"gray", width:"36px" }} />} title={data.datasets[0].data[0].y} content={data.datasets[0].label} unit="" /> }
              </Grid>
              </>
            );
          }
          return null;
        })}
      </Grid>
    ) : (
      <div>
        {this.props.children}
      </div>
    );
  }
  //#endregion

  //#region API Methods
  //#endregion

  //#region Helpers
  //#endregion
}

// import { SvgIcon, SvgIconProps } from '@mui/material';
// import { 
//   AddCircleOutline, 
//   DeleteOutline, 
//   EditOutlined, 
//   SaveOutlined 
// } from '@mui/icons-material';

// type IconName = 'add' | 'delete' | 'edit' | 'save';

// const iconMap: Record<IconName, React.ElementType<SvgIconProps>> = {
//   add: AddCircleOutline,
//   delete: DeleteOutline,
//   edit: EditOutlined,
//   save: SaveOutlined
// };

// interface IconDisplayProps {
//   iconName: IconName;
// }

// function IconDisplay({ iconName }: IconDisplayProps) {
//   const IconComponent = iconMap[iconName];

//   return <SvgIcon component={IconComponent} />;
// }
