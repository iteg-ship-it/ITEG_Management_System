const User = require('../user/models/user');
const jwt = require('jsonwebtoken');

class FaceAuthController {
  // Register face data for a user
  static async registerFace(req, res) {
    try {
      const { email, faceDescriptor } = req.body;

      if (!email || !faceDescriptor) {
        return res.status(400).json({
          success: false,
          message: 'Email and face descriptor are required'
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.faceDescriptor = faceDescriptor;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Face registered successfully'
      });

    } catch (error) {
      console.error('Face registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Login using face recognition
  static async loginWithFace(req, res) {
    try {
      const { faceDescriptor } = req.body;

      if (!faceDescriptor) {
        return res.status(400).json({
          success: false,
          message: 'Face descriptor is required'
        });
      }

      const users = await User.find({ faceDescriptor: { $exists: true, $ne: null } });

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No registered faces found'
        });
      }

      let matchedUser = null;
      let minDistance = 0.35; // Even more strict threshold for security

      for (const user of users) {
        if (user.faceDescriptor) {
          const distance = FaceAuthController.calculateDistance(faceDescriptor, user.faceDescriptor);
          console.log(`Face distance for ${user.email}: ${distance}`);
          if (distance < minDistance) {
            minDistance = distance;
            matchedUser = user;
          }
        }
      }
      
      console.log(`Best match distance: ${minDistance}`);

      if (!matchedUser) {
        return res.status(401).json({
          success: false,
          message: 'Face not recognized'
        });
      }

      const token = jwt.sign(
        { 
          userId: matchedUser._id, 
          email: matchedUser.email,
          role: matchedUser.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        message: 'Face login successful',
        token,
        user: {
          id: matchedUser._id,
          email: matchedUser.email,
          role: matchedUser.role,
          name: matchedUser.name,
          position: matchedUser.position,
          department: matchedUser.department
        }
      });

    } catch (error) {
      console.error('Face login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static calculateDistance(descriptor1, descriptor2) {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
      return 1;
    }

    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    return Math.sqrt(sum);
  }

  static async checkFaceRegistration(req, res) {
    try {
      const { email } = req.params;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        hasFaceRegistered: !!user.faceDescriptor
      });

    } catch (error) {
      console.error('Check face registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = FaceAuthController;