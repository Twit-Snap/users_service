import axios from 'axios';

export class MetricController{

  constructor() {}

  async postUserMetrics(username: string, initialTime: Date , success: boolean, type: string) {
    const eventTime = this.calculateRegistrationTime(initialTime);

    await axios.post(`http://localhost:4000/metrics`, {
      createdAt: new Date(),
      type: type,
      username: username? username: "",
      metrics: {
        event_time: eventTime? eventTime: 0,
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

  private calculateRegistrationTime(eventTime: Date): number {
    const now = new Date();
    const registrationTime = new Date(eventTime);
    return now.getTime() - registrationTime.getTime();
  }

}
