import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AutenticacaoServico {
  async hashSenha(senha: string): Promise<string> {
    return bcrypt.hash(senha, 12);
  }

  async compararSenha(senha: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senha, hash);
  }

  gerarToken(payload: { usuarioId: string; email: string; role: string }): string {
    const secret = process.env.JWT_SECRET || 'ime_secret_key';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  verificarToken(token: string): any {
    const secret = process.env.JWT_SECRET || 'ime_secret_key';
    return jwt.verify(token, secret);
  }
}
