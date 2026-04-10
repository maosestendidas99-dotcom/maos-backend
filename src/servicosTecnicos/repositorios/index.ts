import {
  UsuarioModel, NoticiaModel, ProjetoModel,
  GaleriaModel, DocumentoModel, ContatoModel, MembroModel
} from '@servicosTecnicos/database/schemas';

function mapear(doc: any) {
  const base: any = { ...doc.toObject(), id: doc._id.toString() };
  delete base._id; delete base.__v;
  return base;
}

// ── Usuário ──
export class UsuarioRepositorio {
  async criar(dados: any) { return mapear(await UsuarioModel.create(dados)); }
  async buscarPorEmail(email: string) { const d = await UsuarioModel.findOne({ email }); return d ? mapear(d) : null; }
  async buscarPorId(id: string) { const d = await UsuarioModel.findById(id); return d ? mapear(d) : null; }
  async listar() { return (await UsuarioModel.find()).map(mapear); }
  async atualizar(id: string, dados: any) { const d = await UsuarioModel.findByIdAndUpdate(id, { $set: dados }, { new: true }); return d ? mapear(d) : null; }
}

// ── Notícia ──
export class NoticiaRepositorio {
  async criar(dados: any) { return mapear(await NoticiaModel.create(dados)); }
  async buscarPorId(id: string) { const d = await NoticiaModel.findById(id); return d ? mapear(d) : null; }
  async buscarPorSlug(slug: string) { const d = await NoticiaModel.findOne({ slug }); return d ? mapear(d) : null; }
  async listar(filtros: any = {}, pagina = 1, limite = 10) {
    const query: any = {};
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.publicado !== undefined) query.publicado = filtros.publicado;
    if (filtros.destaque !== undefined) query.destaque = filtros.destaque;
    const skip = (pagina - 1) * limite;
    const [noticias, total] = await Promise.all([
      NoticiaModel.find(query).sort({ criadoEm: -1 }).skip(skip).limit(limite),
      NoticiaModel.countDocuments(query),
    ]);
    return { noticias: noticias.map(mapear), total, pagina, totalPaginas: Math.ceil(total / limite) };
  }
  async atualizar(id: string, dados: any) { const d = await NoticiaModel.findByIdAndUpdate(id, { $set: dados }, { new: true }); return d ? mapear(d) : null; }
  async deletar(id: string) { await NoticiaModel.findByIdAndDelete(id); }
}

// ── Projeto ──
export class ProjetoRepositorio {
  async criar(dados: any) { return mapear(await ProjetoModel.create(dados)); }
  async buscarPorId(id: string) { const d = await ProjetoModel.findById(id); return d ? mapear(d) : null; }
  async listar(filtros: any = {}) {
    const query: any = {};
    if (filtros.status) query.status = filtros.status;
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.destaque !== undefined) query.destaque = filtros.destaque;
    return (await ProjetoModel.find(query).sort({ criadoEm: -1 })).map(mapear);
  }
  async atualizar(id: string, dados: any) { const d = await ProjetoModel.findByIdAndUpdate(id, { $set: dados }, { new: true }); return d ? mapear(d) : null; }
  async deletar(id: string) { await ProjetoModel.findByIdAndDelete(id); }
}

// ── Galeria ──
export class GaleriaRepositorio {
  async criar(dados: any) { return mapear(await GaleriaModel.create(dados)); }
  async buscarPorId(id: string) { const d = await GaleriaModel.findById(id); return d ? mapear(d) : null; }
  async listar(filtros: any = {}) {
    const query: any = {};
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.destaque !== undefined) query.destaque = filtros.destaque;
    return (await GaleriaModel.find(query).sort({ ordem: 1, criadoEm: -1 })).map(mapear);
  }
  async atualizar(id: string, dados: any) { const d = await GaleriaModel.findByIdAndUpdate(id, { $set: dados }, { new: true }); return d ? mapear(d) : null; }
  async deletar(id: string) { await GaleriaModel.findByIdAndDelete(id); }
}

// ── Documento ──
export class DocumentoRepositorio {
  async criar(dados: any) { return mapear(await DocumentoModel.create(dados)); }
  async buscarPorId(id: string) { const d = await DocumentoModel.findById(id); return d ? mapear(d) : null; }
  async listar(filtros: any = {}) {
    const query: any = {};
    if (filtros.categoria) query.categoria = filtros.categoria;
    if (filtros.publico !== undefined) query.publico = filtros.publico;
    return (await DocumentoModel.find(query).sort({ criadoEm: -1 })).map(mapear);
  }
  async atualizar(id: string, dados: any) { const d = await DocumentoModel.findByIdAndUpdate(id, { $set: dados }, { new: true }); return d ? mapear(d) : null; }
  async deletar(id: string) { await DocumentoModel.findByIdAndDelete(id); }
}

// ── Contato ──
export class ContatoRepositorio {
  async criar(dados: any) { return mapear(await ContatoModel.create(dados)); }
  async listar(filtros: any = {}) {
    const query: any = {};
    if (filtros.lido !== undefined) query.lido = filtros.lido;
    return (await ContatoModel.find(query).sort({ criadoEm: -1 })).map(mapear);
  }
  async atualizar(id: string, dados: any) { const d = await ContatoModel.findByIdAndUpdate(id, { $set: dados }, { new: true }); return d ? mapear(d) : null; }
  async deletar(id: string) { await ContatoModel.findByIdAndDelete(id); }
}

// ── Membro ──
export class MembroRepositorio {
  async criar(dados: any) { return mapear(await MembroModel.create(dados)); }
  async buscarPorId(id: string) { const d = await MembroModel.findById(id); return d ? mapear(d) : null; }
  async listar(filtros: any = {}) {
    const query: any = {};
    if (filtros.ativo !== undefined) query.ativo = filtros.ativo;
    return (await MembroModel.find(query).sort({ ordem: 1 })).map(mapear);
  }
  async atualizar(id: string, dados: any) { const d = await MembroModel.findByIdAndUpdate(id, { $set: dados }, { new: true }); return d ? mapear(d) : null; }
  async deletar(id: string) { await MembroModel.findByIdAndDelete(id); }
}