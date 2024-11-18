import { ModifiableUser, PublicUser } from 'user';
import { UserController } from '../../controllers/userController';
import { UserService } from '../../services/userService';
import { AuthenticationError, ValidationError } from '../../types/customErrors';

jest.mock('../../services/userService');

const authUser = {
  email: 'test@test.com',
  userId: 1,
  username: 'test',
  phoneNumber: '+541112341234',
  verified: false
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

  describe('canUserChangeBlock', () => {
    it('should let change user isBlocked state if the auth user is an admin', () => {
      expect(() =>
        new UserController().canUserChangeBlock({ ...authUser, type: 'admin' }, { isBlocked: true })
      ).not.toThrow();
    });

    it('should raise a AuthenticationError if the auth user is not an admin and want to change the isBlocked state', () => {
      expect(() =>
        new UserController().canUserChangeBlock({ ...authUser, type: 'user' }, { isBlocked: false })
      ).toThrow(AuthenticationError);
    });
  });

  describe('newValuesHasExtraKeys', () => {
    it('should not raise an error if all specified keys are modifiable', () => {
      expect(() =>
        new UserController().newValuesHasExtraKeys({ username: 'pepito', name: 'dorito1234' })
      ).not.toThrow();
    });

    it('should not raise an error if newValues is an empty object', () => {
      expect(() => new UserController().newValuesHasExtraKeys({})).not.toThrow();
    });

    it('should raise a ValidationError if newValues has no modifiable keys', () => {
      expect(() => new UserController().newValuesHasExtraKeys({ id: 1 } as ModifiableUser)).toThrow(
        ValidationError
      );
    });
  });
});
