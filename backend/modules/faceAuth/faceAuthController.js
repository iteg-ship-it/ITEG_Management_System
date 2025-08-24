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
      console.log('Face login request received');
      const { faceDescriptor } = req.body;

      if (!faceDescriptor) {
        console.log('No face descriptor provided');
        return res.status(400).json({
          success: false,
          message: 'Face descriptor is required'
        });
      }

      console.log('Face descriptor length:', faceDescriptor.length);
      
      const users = await User.find({ faceDescriptor: { $exists: true, $ne: null } });
      console.log('Found users with face descriptors:', users.length);

      if (users.length === 0) {
        console.log('No registered faces found');
        return res.status(404).json({
          success: false,
          message: 'No registered faces found. Please register your face first.'
        });
      }

      let matchedUser = null;
      let minDistance = 0.4; // Stricter threshold for better security
      let bestDistance = Infinity;

      for (const user of users) {
        if (user.faceDescriptor) {
          const distance = FaceAuthController.calculateDistance(faceDescriptor, user.faceDescriptor);
          console.log(`🔍 Face distance for ${user.email}: ${distance}`);
          console.log(`📊 Threshold: ${minDistance}`);
          
          if (distance < bestDistance) {
            bestDistance = distance;
            if (distance < minDistance) {
              matchedUser = user;
              console.log(`✅ Valid match: ${user.email} with distance ${distance}`);
            } else {
              console.log(`❌ Distance ${distance} exceeds threshold ${minDistance} for ${user.email}`);
            }
          }
        }
      }
      
      console.log(`Best match distance: ${bestDistance}`);
      console.log(`Threshold: ${minDistance}`);
      console.log(`Match found: ${!!matchedUser}`);

      if (!matchedUser) {
        console.log(`❌ Face authentication failed. Best distance: ${bestDistance}, Required: < ${minDistance}`);
        return res.status(401).json({
          success: false,
          message: `Face not recognized. Please ensure you are the registered user and position your face clearly in the camera.`
        });
      }
      
      console.log(`✅ Face authentication successful for ${matchedUser.email} with distance ${bestDistance}`);

      const token = jwt.sign(
        { 
          id: matchedUser._id, 
          email: matchedUser.email,
          role: matchedUser.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      const refreshToken = jwt.sign(
        { id: matchedUser._id, role: matchedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '4h' }
      );

      matchedUser.refreshToken = refreshToken;
      await matchedUser.save();

      res.status(200).json({
        success: true,
        message: 'Face login successful',
        token,
        refreshToken,
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
    if (!descriptor1 || !descriptor2) {
      console.log('❌ Missing descriptors');
      return 1;
    }
    
    if (descriptor1.length !== descriptor2.length) {
      console.log(`❌ Length mismatch: ${descriptor1.length} vs ${descriptor2.length}`);
      return 1;
    }

    console.log(`📊 Calculating distance between descriptors of length ${descriptor1.length}`);

    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      const diff = descriptor1[i] - descriptor2[i];
      sum += diff * diff;
    }
    const distance = Math.sqrt(sum);
    console.log(`📏 Final calculated distance: ${distance}`);
    return distance;
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