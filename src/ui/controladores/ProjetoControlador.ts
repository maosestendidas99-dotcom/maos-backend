import { Request, Response } from 'express';
import { ProjetoModel } from '@servicosTecnicos/database/schemas/index';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

export class ProjetoControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { categoria, status, destaque } = req.query as Record<string, string>;
      const query: Record<string, any> = {};
      if (categoria) query.categoria = categoria;
      if (status)    query.status    = status;
      if (destaque === 'true') query.destaque = true;
      const projetos = await ProjetoModel.find(query as any).sort({ criadoEm: -1 });
      res.json({ projetos, total: projetos.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const projeto = await ProjetoModel.findById(String(req.params.id));
      if (!projeto) { res.status(404).json({ erro: 'Projeto não encontrado' }); return; }
      res.json(projeto);
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const {
        titulo, descricao, descricaoCompleta, status,
        categoria, beneficiados, dataInicio, dataFim, destaque,
      } = req.body;
      if (!titulo || !descricao) {
        res.status(400).json({ erro: 'Título e descrição obrigatórios' }); return;
      }
      let imagemUrl: string | undefined;
      let imagemPublicId: string | undefined;
      if (req.file) {
        const r = await storage.upload(req.file, 'projetos');
        imagemUrl = r.urlPublica; imagemPublicId = r.publicId;
      }
      const dados: Record<string, any> = {
        titulo, descricao, descricaoCompleta,
        imagemUrl, imagemPublicId,
        status:       status    || 'ativo',
        categoria:    categoria || 'outros',
        beneficiados: beneficiados ? Number(beneficiados) : undefined,
        dataInicio,
        dataFim,
        destaque:     destaque === 'true',
      };
      const projeto = await ProjetoModel.create(dados);
      res.status(201).json(projeto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: Record<string, any> = { ...req.body };
      if (dados.beneficiados)              dados.beneficiados = Number(dados.beneficiados);
      if (dados.destaque !== undefined)    dados.destaque     = dados.destaque === 'true';
      if (req.file) {
        const r = await storage.upload(req.file, 'projetos');
        dados.imagemUrl = r.urlPublica; dados.imagemPublicId = r.publicId;
      }
      const projeto = await ProjetoModel.findByIdAndUpdate(
        String(req.params.id),
        { $set: dados },
        { new: true }
      );
      if (!projeto) { res.status(404).json({ erro: 'Projeto não encontrado' }); return; }
      res.json(projeto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const projeto = await ProjetoModel.findByIdAndDelete(String(req.params.id));
      if (!projeto) { res.status(404).json({ erro: 'Projeto não encontrado' }); return; }
      if (projeto.imagemPublicId) await storage.deletar(projeto.imagemPublicId);
      res.json({ mensagem: 'Projeto excluído' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}