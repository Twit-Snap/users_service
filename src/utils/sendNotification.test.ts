import { sendPushNotification } from './sendNotification';

describe('Send Push Notification', () => {
  beforeEach(() => {
    // Mock the fetch function
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ success: true })
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should send a notification', async () => {
    const expoPushToken = 'expoPushToken';
    const title = 'Test Title';
    const body = 'Test Body';
    const data = {};
    const sound = 'default';

    await sendPushNotification(expoPushToken, title, body, data, sound);

    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        host: 'exp.host',
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: sound,
        title: title,
        body: body,
        data: data
      })
    });
  });
});
