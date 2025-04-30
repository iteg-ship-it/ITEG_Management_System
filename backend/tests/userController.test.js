const jwt = require("jsonwebtoken");
const User = require("../modules/user/models/user");
const { refreshAccessToken, logout } = require("../modules/user/controllers/userController"); // ✅ FIXED

jest.mock("../modules/user/models/user");
jest.mock("jsonwebtoken");


describe("refreshAccessToken", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it("should return 401 if refresh token is missing", async () => {
    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Refresh token required" });
  });

  it("should return 403 if refresh token is not found in DB", async () => {
    req.body.refreshToken = "fake_token";
    User.findOne.mockResolvedValue(null);

    await refreshAccessToken(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ refreshToken: "fake_token" });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid refresh token" });
  });

  it("should return 403 if refresh token is invalid or expired", async () => {
    req.body.refreshToken = "fake_token";
    const mockUser = { _id: "123", role: "student", refreshToken: "fake_token" };
    User.findOne.mockResolvedValue(mockUser);

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error("Token expired"), null);
    });

    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired refresh token" });
  });

  it("should return new access token if refresh token is valid", async () => {
    req.body.refreshToken = "valid_refresh_token";
    const mockUser = { _id: "123", role: "admin", refreshToken: "valid_refresh_token" };
    User.findOne.mockResolvedValue(mockUser);

    const decoded = { id: "123" };

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, decoded);
    });

    jwt.sign.mockReturnValue("new_access_token");

    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access token refreshed",
      accessToken: "new_access_token"
    });
  });

  it("should handle server error", async () => {
    req.body.refreshToken = "any";
    User.findOne.mockRejectedValue(new Error("DB error"));

    await refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
      error: "DB error"
    });
  });
});



// Test for logout function in userController
describe("logout", () => {
  let req, res;

  beforeEach(() => {
    req = { body: { _id: "123" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if _id is not provided", async () => {
    req.body = {}; // No _id
    await logout(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User ID is required" });
  });

  it("should return 404 if user not found", async () => {
    User.findById.mockResolvedValue(null); // user not found
    await logout(req, res);
    expect(User.findById).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should logout user and remove refresh token", async () => {
    const mockUser = {
      refreshToken: "someToken",
      save: jest.fn().mockResolvedValue(true),
    };

    User.findById.mockResolvedValue(mockUser);

    await logout(req, res);

    expect(User.findById).toHaveBeenCalledWith("123");
    expect(mockUser.refreshToken).toBeNull();
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Logged out successfully, refresh token removed",
    });
  });

  it("should handle server error", async () => {
    const error = new Error("DB error");
    User.findById.mockRejectedValue(error);

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
      error: "DB error",
    });
  });
});
