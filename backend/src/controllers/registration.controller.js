// backend/src/controllers/registration.controller.js
import pool from '../config/database.js';

export const createRegistration = async (req, res) => {
  const {
    fullName, email, mobileNumber, role, instituteName, department,
    knowsPython, aicteQuantumCourse, knowsQuantumBasics, usedQiskitBefore
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'ID card is required' } });
  }

  try {
    const result = await registrationService.registerUser(req.body)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  registerUser,
}
