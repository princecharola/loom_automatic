import { User } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signToken } from '../utils/token.js';

function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    assignedMachineIds: user.assignedMachineIds,
    isActive: user.isActive
  };
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password, role = 'OPERATOR' } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      role,
      passwordHash: hashPassword(password)
    });

    return res.status(201).json(sanitizeUser(user));
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !verifyPassword(password, user.passwordHash) || !user.isActive) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken({ sub: user._id.toString(), role: user.role, email: user.email });

    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(sanitizeUser(user));
  } catch (error) {
    return next(error);
  }
}
