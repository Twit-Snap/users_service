import { UserController } from '../../controller/userController';
import { UserService } from '../../services/userService';
import { PublicUser } from 'user';

jest.mock('../../services/adminService');

describe('UserController', () => {
  let controller: UserController;


  const aMockUser: PublicUser = {
    username: 'aUser',
    birthdate: new Date(),
    createdAt: new Date(),
  }

  beforeEach(() => {

    const serviceMock = {
      getUserByUsername: jest.fn().mockResolvedValue(aMockUser),
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(serviceMock);

  });

  describe('Get public user', () => {
    it('should get user by username successfully', async () => {

      const validaUsername = 'aUser'
      const response = await controller.getUserByUsername(validaUsername);
      expect(response).toEqual({ data: aMockUser });
    });

    it('should raise an error if the username is empty', async() => {
      const invalidaUsername = 'invalidaUsername'
      const response = await controller.getUserByUsername(invalidaUsername);
      expect(response).toEqual({ data: aMockUser });
    });

  });
});