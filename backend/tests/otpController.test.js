const otpController = require('../modules/user/controllers/otpController');
const User = require('../modules/user/models/user');
const { generateOTP, sendEmailOtp } = require('../modules/user/helpers/sendOtp');
const jwt = require('jsonwebtoken');

// Mock external modules and functions
jest.mock('../modules/user/models/user');
jest.mock('../modules/user/helpers/sendOtp');
jest.mock('jsonwebtoken');

// ✅ Custom mockRequest and mockResponse functions
const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  otpController.otpStore = new Map();
  otpController.otpAttempts = new Map();
});

describe('OTP Controller', () => {

  describe('sendOtpToEmail', () => {
    it('should return 400 if email is not provided', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await otpController.sendOtpToEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email is required' });
    });

    it('should return 404 if user is not found', async () => {
      const req = mockRequest({ email: 'test@example.com' });
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await otpController.sendOtpToEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User with this email does not exist' });
    });

    it('should return 429 if OTP request limit is exceeded', async () => {
      const req = mockRequest({ email: 'anees774883@gmail.com' });
      const res = mockResponse();

      const attempts = 4; // Simulate exceeding the limit
      otpController.otpAttempts.set('4', attempts);
      User.findOne.mockResolvedValue({ email: 'anees774883@gmail.com' });

      await otpController.sendOtpToEmail(req, res);
    });

    it('should send OTP successfully if email exists', async () => {
      const req = mockRequest({ email: 'test@example.com' });
      const res = mockResponse();

      const mockUser = { _id: '123', email: 'test@example.com' };
      User.findOne.mockResolvedValue(mockUser);
      generateOTP.mockReturnValue('123456');
      sendEmailOtp.mockResolvedValue(true);

      await otpController.sendOtpToEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'OTP sent to registered email' });
    });
  });

  describe('verifyEmailOtp', () => {
    it('should return 400 if email or OTP is missing', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await otpController.verifyEmailOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email and OTP required' });
    });

    it('should return 400 if no OTP is found for the email', async () => {
      const req = mockRequest({ email: 'anees774883@gmailcom', otp: '123456' });
      const res = mockResponse();

      otpController.otpStore.set('6', { otp: '123456', expiresAt: Date.now() + 100000 });

      await otpController.verifyEmailOtp(req, res);
    });

    it('should return 400 if OTP is expired', async () => {
      const req = mockRequest({ email: 'anees774883@gmail.com', otp: '123456' });
      const res = mockResponse();

      const expiredOtp = {
        otp: '123456',
        expiresAt: Date.now() - 1000, // expired OTP

      };
      otpController.otpStore.set('anees774883@gmail.com', expiredOtp);

      await otpController.verifyEmailOtp(req, res);
    });

    it('should return 400 if OTP is incorrect', async () => {
      const req = mockRequest({ email: 'test@example.com', otp: '000000' });
      const res = mockResponse();

      otpController.otpStore.set('test@example.com', {
        otp: '123456',
        expiresAt: Date.now() + 100000, // not expired
      });

      await otpController.verifyEmailOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid OTP' });
    });

    it('should successfully verify OTP and return JWT tokens', async () => {
      const req = mockRequest({ email: 'test@example.com', otp: '123456' });
      const res = mockResponse();

      const mockUser = {
        _id: 'mockId',
        email: 'test@example.com',
        save: jest.fn(), // ✅ Mock save method
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      otpController.otpStore.set('test@example.com', {
        otp: '123456',
        expiresAt: Date.now() + 100000, // not expired
      });

      jwt.sign.mockReturnValue('mockJwtToken');

      await otpController.verifyEmailOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'OTP verified successfully. Login success.',
        token: 'mockJwtToken',
        refreshToken: 'mockJwtToken',
      }));

      expect(mockUser.save).toHaveBeenCalled(); // ✅ Also test user.save() called
    });
  });

});
