import { UserController } from '../../controllers/userController';
import { UserService } from '../../services/userService';
import { PublicUser } from 'user';
import { ValidationError } from '../../types/customErrors';

jest.mock('../../services/userService');

describe('UserController', () => {
  let controller: UserController;

  const username = 'usernameTest';

  const aMockUserProfile: PublicUser = {
    username: username,
    name: 'user',
    birthdate: new Date(),
    createdAt: new Date(),
  }

  beforeEach(() => {
    const serviceMock = {
      getPublicUser: jest.fn().mockResolvedValue(aMockUserProfile),
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(serviceMock);
  });

  describe('Get public user', () => {
    it('should get user by username successfully', async () => {
      const validaUsername = 'aUser';
      const response = await controller.getUserByUsername(validaUsername);
      expect(response).toEqual({ data: aMockUserProfile });
    });

    it('should raise an error if the username is empty', async () => {
      const invalidaUsername = '';
      await expect(controller.getUserByUsername(invalidaUsername)).rejects.toThrow(ValidationError);
    });
  });
});
