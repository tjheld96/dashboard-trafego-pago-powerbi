import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { signToken } from '../auth';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, username, password } = req.body || {};
  if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();
  if (!normalizedEmail || !normalizedUsername || password.length < 6) {
    return res.status(400).json({ error: 'E-mail, usuário e senha (mín. 6 caracteres) são obrigatórios.' });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: normalizedEmail }, { username: normalizedUsername }] },
  });
  if (existing) {
    return res.status(409).json({ error: 'E-mail ou usuário já cadastrado.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, username: normalizedUsername, passwordHash },
  });

  const token = signToken({ userId: user.id });
  res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });

  const token = signToken({ userId: user.id });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
});
