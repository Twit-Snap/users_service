import axios from 'axios';

export class MetricController{

  constructor() {}

  async postUserMetrics(username: string, eventTime: number, processInitialTime: Date, success: boolean, type: string) {
    const finalTime = this.calculateRegistrationTime(eventTime, processInitialTime);

    await axios.post(`http://localhost:4000/metrics`, {
      createdAt: new Date(),
      type: type,
      username: username? username: "",
      metrics: {
        event_time: finalTime? finalTime: 0,
        success: success
      }
    })
  }

  async postRegisterProviderMetrics(username: string, provider: string) {

    await axios.post(`http://localhost:4000/metrics`, {
      createdAt: new Date(),
      type: 'register_with_provider',
      username: username? username: "",
      metrics: {
        provider: provider
      }
    })
  }

  async postLoginProviderMetrics(username: string, success: boolean) {

    await axios.post(`http://localhost:4000/metrics`, {
      createdAt: new Date(),
      type: 'login_with_provider',
      username: username? username: "",
      metrics: {
        success: success
      }
    })
  }

  async postBlockMetric(username: string | undefined) {
    await axios.post(`http://localhost:4000/metrics`, {
      createdAt: new Date(),
      type: "blocked",
      username: username? username: "",
      metrics: {
        blocked: true
      }
    })
  }

  private calculateRegistrationTime(eventTime: number, processTime: Date): number {
    const now = new Date();
    const spentTime = now.getTime() - processTime.getTime();
    return eventTime + spentTime;
  }

}
