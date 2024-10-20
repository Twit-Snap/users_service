import { PublicUser } from 'user';
import { UserController } from '../../controllers/userController';
import { UserService } from '../../services/userService';
import { ValidationError } from '../../types/customErrors';

jest.mock('../../services/userService');

const authUser = {
  email: 'test@test.com',
  userId: 1,
  username: 'test'
};

describe('UserController', () => {
  let controller: UserController;

  const username = 'usernameTest';

  const aMockUserProfile: PublicUser = {
    id: 1,
    username: username,
    name: 'user',
    birthdate: new Date(),
    createdAt: new Date(),
    isPrivate: false
  };

  beforeEach(() => {
    const serviceMock = {
      getUser: jest.fn().mockResolvedValue(aMockUserProfile)
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(serviceMock);
  });

  describe('Get public user', () => {
    it('should get user by username successfully', async () => {
      const validaUsername = 'aUser';
      const response = await controller.getUserByUsername(validaUsername, {
        ...authUser,
        type: 'user'
      });
      expect(response).toEqual({ data: aMockUserProfile });
    });

    it('should raise an error if the username is empty', async () => {
      const invalidaUsername = '';
      await expect(
        controller.getUserByUsername(invalidaUsername, { ...authUser, type: 'user' })
      ).rejects.toThrow(ValidationError);
    });
  });
});
