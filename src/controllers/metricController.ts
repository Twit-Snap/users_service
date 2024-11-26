import axios from 'axios';

export class MetricController {
  constructor() {}

  async postUserMetrics(
    username: string,
    eventTime: number,
    processInitialTime: Date,
    success: boolean,
    type: string
  ) {
    const finalTime = this.calculateRegistrationTime(eventTime, processInitialTime);

    await axios
      .post(`${process.env.METRICS_SERVICE_URL}/metrics`, {
        createdAt: new Date(),
        type: type,
        username: username ? username : '',
        metrics: {
          event_time: finalTime ? finalTime : 0,
          success: success
        }
      })
      .catch((error) => {
        console.error('Error posting metrics', error);
      });
  }

  async postRegisterProviderMetrics(username: string) {
    await axios
      .post(`${process.env.METRICS_SERVICE_URL}/metrics`, {
        createdAt: new Date(),
        type: 'register_with_provider',
        username: username ? username : '',
        metrics: {}
      })
      .catch((error) => {
        console.error('Error posting metrics', error);
      });
  }

  async postLoginProviderMetrics(username: string, success: boolean) {
    await axios
      .post(`${process.env.METRICS_SERVICE_URL}/metrics`, {
        createdAt: new Date(),
        type: 'login_with_provider',
        username: username ? username : '',
        metrics: {
          success: success
        }
      })
      .catch((error) => {
        console.error('Error posting metrics', error);
      });
  }

  async postBlockMetric(username: string | undefined) {
    await axios
      .post(`${process.env.METRICS_SERVICE_URL}/metrics`, {
        createdAt: new Date(),
        type: 'blocked',
        username: username ? username : '',
        metrics: {
          blocked: true
        }
      })
      .catch((error) => {
        console.error('Error posting metrics', error);
      });
  }

  async postLocationMetrics(username: string, latitude: number, longitude: number) {
    await axios
      .post(`${process.env.METRICS_SERVICE_URL}/metrics`, {
        createdAt: new Date(),
        type: 'location',
        username: username ? username : '',
        metrics: {
          latitude: latitude,
          longitude: longitude
        }
      })
      .catch((error) => {
        console.error('Error posting metrics', error);
      });
  }

  async postFollowMetric(followedUser: string, isFollowed: boolean) {
    await axios
      .post(`${process.env.METRICS_SERVICE_URL}/metrics`, {
        createdAt: new Date(),
        type: 'follow',
        username: followedUser,
        metrics: {
          followed: isFollowed,
          amount: 1
        }
      })
      .catch((error) => {
        console.log('Error posting metrics', error);
      });
  }

  private calculateRegistrationTime(eventTime: number, processTime: Date): number {
    const now = new Date();
    const spentTime = now.getTime() - processTime.getTime();
    //agregar  error en el caso de que sea negativo
    return eventTime + spentTime;
  }
}
