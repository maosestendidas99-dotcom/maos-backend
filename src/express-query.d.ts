// Override do tipo req.query do Express para retornar string simples
// Coloque em: src/express-query.d.ts
import 'express';

declare global {
  namespace Express {
    interface Request {
      query: {
        [key: string]: string | undefined;
      };
    }
  }
}

export {};