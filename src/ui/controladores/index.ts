import { Request, Response } from 'express';
import {
  NoticiaRepositorio, ProjetoRepositorio, GaleriaRepositorio,
  DocumentoRepositorio, ContatoRepositorio, MembroRepositorio
} from '@servicosTecnicos/repositorios';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const storage = new ArmazenamentoServico();

// Helper: garante string pura — nunca string[]
function qs(val: unknown): string {
  if (Array.isArray(val)) return String((val as string[])[0] ?? '');
  if (val !== null && typeof val === 'object') return '';
  return String(val ?? '');
}

// Helper: string ou undefined para filtros opcionais
function qsOpt(val: unknown): string | undefined {
  if (val === undefined || val === null) return undefined;
  if (Array.isArray(val)) {
    const first = (val as string[])[0];
    return first ? String(first) : undefined;
  }
  if (typeof val === 'object') return undefined;
  const s = String(val);
  return s || undefined;
}

// ── Notícias ──
const noticiaRepo = new NoticiaRepositorio();

function gerarSlug(titulo: string): string {
  return titulo.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    + '-' + Date.now();
}

export class NoticiaControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const pagina    = parseInt(qs(req.query.pagina)  || '1');
      const limite    = parseInt(qs(req.query.limite)  || '10');
      const categoria = qsOpt(req.query.categoria);
      const destaque  = qsOpt(req.query.destaque);
      const resultado = await noticiaRepo.listar(
        { categoria, publicado: true, destaque: destaque === 'true' ? true : undefined },
        pagina, limite
      );
      res.json(resultado);
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async listarAdmin(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const pagina = parseInt(qs(req.query.pagina) || '1');
      const limite = parseInt(qs(req.query.limite) || '20');
      const resultado = await noticiaRepo.listar({}, pagina, limite);
      res.json(resultado);
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async buscarPorSlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = String(req.params.slug ?? '');
      const noticia = await noticiaRepo.buscarPorSlug(slug);
      if (!noticia || !noticia.publicado) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(noticia);
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { titulo, subtitulo, conteudo, categoria, destaque, publicado, autor, tags } = req.body;
      if (!titulo || !conteudo) { res.status(400).json({ erro: 'Título e conteúdo obrigatórios' }); return; }
      let imagemUrl: string | undefined;
      let imagemPublicId: string | undefined;
      if (req.file) {
        const r = await storage.upload(req.file, 'noticias');
        imagemUrl = r.urlPublica; imagemPublicId = r.publicId;
      }
      const noticia = await noticiaRepo.criar({
        titulo, subtitulo, conteudo, slug: gerarSlug(titulo),
        imagemUrl, imagemPublicId, categoria: categoria || 'noticias',
        destaque: destaque === 'true', publicado: publicado === 'true',
        autor, tags: tags ? JSON.parse(tags) : [],
      });
      res.status(201).json(noticia);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.destaque  !== undefined) dados.destaque  = dados.destaque  === 'true';
      if (dados.publicado !== undefined) dados.publicado = dados.publicado === 'true';
      if (dados.tags && typeof dados.tags === 'string') dados.tags = JSON.parse(dados.tags);
      if (req.file) {
        const r = await storage.upload(req.file, 'noticias');
        dados.imagemUrl = r.urlPublica; dados.imagemPublicId = r.publicId;
      }
      const id = String(req.params.id ?? '');
      const noticia = await noticiaRepo.atualizar(id, dados);
      if (!noticia) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(noticia);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');
      await noticiaRepo.deletar(id);
      res.json({ mensagem: 'Excluído com sucesso' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Projetos ──
const projetoRepo = new ProjetoRepositorio();

export class ProjetoControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const status    = qsOpt(req.query.status);
      const categoria = qsOpt(req.query.categoria);
      const destaque  = qsOpt(req.query.destaque);
      const projetos  = await projetoRepo.listar({
        status,
        categoria,
        destaque: destaque === 'true' ? true : undefined,
      });
      res.json({ projetos, total: projetos.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');
      const projeto = await projetoRepo.buscarPorId(id);
      if (!projeto) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(projeto);
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.destaque     !== undefined) dados.destaque     = dados.destaque     === 'true';
      if (dados.beneficiados)               dados.beneficiados = Number(dados.beneficiados);
      if (req.file) {
        const r = await storage.upload(req.file, 'projetos');
        dados.imagemUrl = r.urlPublica; dados.imagemPublicId = r.publicId;
      }
      const projeto = await projetoRepo.criar(dados);
      res.status(201).json(projeto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.destaque     !== undefined) dados.destaque     = dados.destaque     === 'true';
      if (dados.beneficiados)               dados.beneficiados = Number(dados.beneficiados);
      if (req.file) {
        const r = await storage.upload(req.file, 'projetos');
        dados.imagemUrl = r.urlPublica; dados.imagemPublicId = r.publicId;
      }
      const id = String(req.params.id ?? '');
      const projeto = await projetoRepo.atualizar(id, dados);
      if (!projeto) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(projeto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');
      await projetoRepo.deletar(id);
      res.json({ mensagem: 'Excluído com sucesso' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Galeria ──
const galeriaRepo = new GaleriaRepositorio();

export class GaleriaControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const categoria = qsOpt(req.query.categoria);
      const destaque  = qsOpt(req.query.destaque);
      const fotos     = await galeriaRepo.listar({
        categoria,
        destaque: destaque === 'true' ? true : undefined,
      });
      res.json({ fotos, total: fotos.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ erro: 'Imagem obrigatória' }); return; }
      const r = await storage.upload(req.file, 'galeria');
      const dados: any = { ...req.body, imagemUrl: r.urlPublica, imagemPublicId: r.publicId };
      if (dados.destaque !== undefined) dados.destaque = dados.destaque === 'true';
      if (dados.ordem)                  dados.ordem    = Number(dados.ordem);
      const foto = await galeriaRepo.criar(dados);
      res.status(201).json(foto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.destaque !== undefined) dados.destaque = dados.destaque === 'true';
      if (dados.ordem)                  dados.ordem    = Number(dados.ordem);
      const id = String(req.params.id ?? '');
      const foto = await galeriaRepo.atualizar(id, dados);
      if (!foto) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(foto);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');
      const foto = await galeriaRepo.buscarPorId(id);
      if (foto?.imagemPublicId) await storage.deletar(foto.imagemPublicId, 'image');
      await galeriaRepo.deletar(id);
      res.json({ mensagem: 'Excluído com sucesso' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Documentos ──
const documentoRepo = new DocumentoRepositorio();

export class DocumentoControlador {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const categoria = qsOpt(req.query.categoria);
      const docs      = await documentoRepo.listar({ categoria, publico: true });
      res.json({ documentos: docs, total: docs.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async listarAdmin(_req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const docs = await documentoRepo.listar({});
      res.json({ documentos: docs, total: docs.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ erro: 'Arquivo obrigatório' }); return; }
      const r = await storage.upload(req.file, 'documentos');
      const dados: any = {
        ...req.body,
        arquivoUrl:      r.urlPublica,
        arquivoPublicId: r.publicId,
        nomeArquivo:     req.file.originalname,
        tamanho:         req.file.size,
      };
      if (dados.publico !== undefined) dados.publico = dados.publico === 'true';
      const doc = await documentoRepo.criar(dados);
      res.status(201).json(doc);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.publico !== undefined) dados.publico = dados.publico === 'true';
      const id = String(req.params.id ?? '');
      const doc = await documentoRepo.atualizar(id, dados);
      if (!doc) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(doc);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');
      const doc = await documentoRepo.buscarPorId(id);
      if (doc?.arquivoPublicId) await storage.deletar(doc.arquivoPublicId, 'raw');
      await documentoRepo.deletar(id);
      res.json({ mensagem: 'Excluído com sucesso' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Contato ──
const contatoRepo = new ContatoRepositorio();

export class ContatoControlador {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, telefone, assunto, mensagem } = req.body;
      if (!nome || !email || !assunto || !mensagem) {
        res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' }); return;
      }
      const contato = await contatoRepo.criar({
        nome, email, telefone, assunto, mensagem,
        lido: false, respondido: false,
      });
      res.status(201).json({ mensagem: 'Mensagem enviada com sucesso!', id: contato.id });
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async listar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const lido     = qsOpt(req.query.lido);
      const contatos = await contatoRepo.listar({
        lido: lido === 'true' ? true : lido === 'false' ? false : undefined,
      });
      res.json({ contatos, total: contatos.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async marcarLido(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');
      const contato = await contatoRepo.atualizar(id, { lido: true });
      res.json(contato);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');
      await contatoRepo.deletar(id);
      res.json({ mensagem: 'Excluído' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}

// ── Membros ──
const membroRepo = new MembroRepositorio();

export class MembroControlador {
  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const membros = await membroRepo.listar({ ativo: true });
      res.json({ membros, total: membros.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async listarAdmin(_req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const membros = await membroRepo.listar({});
      res.json({ membros, total: membros.length });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.ordem !== undefined) dados.ordem = Number(dados.ordem);
      if (dados.ativo !== undefined) dados.ativo = dados.ativo === 'true';
      if (req.file) {
        const r = await storage.upload(req.file, 'membros');
        dados.fotoUrl = r.urlPublica; dados.fotoPublicId = r.publicId;
      }
      const membro = await membroRepo.criar(dados);
      res.status(201).json(membro);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados: any = { ...req.body };
      if (dados.ordem !== undefined) dados.ordem = Number(dados.ordem);
      if (dados.ativo !== undefined) dados.ativo = dados.ativo === 'true';
      if (req.file) {
        const r = await storage.upload(req.file, 'membros');
        dados.fotoUrl = r.urlPublica; dados.fotoPublicId = r.publicId;
      }
      const id = String(req.params.id ?? '');
      const membro = await membroRepo.atualizar(id, dados);
      if (!membro) { res.status(404).json({ erro: 'Não encontrado' }); return; }
      res.json(membro);
    } catch (e: any) { res.status(400).json({ erro: e.message }); }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const id = String(req.params.id ?? '');
      await membroRepo.deletar(id);
      res.json({ mensagem: 'Excluído' });
    } catch (e: any) { res.status(500).json({ erro: e.message }); }
  }
}