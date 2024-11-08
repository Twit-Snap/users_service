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

  private calculateRegistrationTime(eventTime: Date): number {
    const now = new Date();
    const registrationTime = new Date(eventTime);
    return now.getTime() - registrationTime.getTime();
  }

}
