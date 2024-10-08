import { UserController } from '../../controller/userController';
import { UserService } from '../../services/userService';
import { PublicUserProfile } from 'user';
import { ValidationError } from '../../types/customErrors';

jest.mock('../../services/userService');

describe('UserController', () => {
  let controller: UserController;

  const username = 'usernameTest'
  const aMockTwitUser = {
    id: 1,
    username: username,
    name: 'user',
  }

  const aMockTwit = {
    id: 1,
    createdAt: new Date(),
    user: aMockTwitUser,
    content: 'Hello word',
  }

  const aMockUserProfile: PublicUserProfile = {
    username: username,
    birthdate: new Date(),
    createdAt: new Date(),
    twits: [aMockTwit],
  }


  beforeEach(() => {

    const serviceMock = {
      getUserPublicProfile: jest.fn().mockResolvedValue(aMockUserProfile),
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(serviceMock);

  });

  describe('Get public user', () => {
    it('should get user by username successfully', async () => {

      const validaUsername = 'aUser'
      const response = await controller.getUserByUsername(validaUsername);
      expect(response).toEqual({ data: aMockUserProfile });
    });

    it('should raise an error if the username is empty', async() => {
      const invalidaUsername = '';
      await expect(controller.getUserByUsername(invalidaUsername)).rejects.toThrow(ValidationError);

    });

  });
});