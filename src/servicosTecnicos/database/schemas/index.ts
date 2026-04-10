import mongoose, { Schema, Document } from 'mongoose';

// ── Interfaces ──

export interface IUsuario extends Document {
  nome: string;
  email: string;
  senhaHash: string;
  role: 'admin' | 'editor';
  ativo: boolean;
  criadoEm: Date;
}

export interface INoticia extends Document {
  titulo: string;
  subtitulo?: string;
  conteudo: string;
  slug: string;
  imagemUrl?: string;
  imagemPublicId?: string;
  categoria: string;
  destaque: boolean;
  publicado: boolean;
  autor?: string;
  tags: string[];
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface IProjeto extends Document {
  titulo: string;
  descricao: string;
  descricaoCompleta?: string;
  imagemUrl?: string;
  imagemPublicId?: string;
  status: string;
  categoria: string;
  beneficiados?: number;
  dataInicio?: string;
  dataFim?: string;
  destaque: boolean;
  criadoEm: Date;
}

export interface IGaleria extends Document {
  titulo: string;
  descricao?: string;
  imagemUrl: string;
  imagemPublicId: string;
  categoria: string;
  destaque: boolean;
  ordem: number;
  criadoEm: Date;
}

export interface IDocumento extends Document {
  titulo: string;
  descricao?: string;
  categoria: string;
  arquivoUrl: string;
  arquivoPublicId: string;
  nomeArquivo?: string;
  tamanho: number;
  publico: boolean;
  criadoEm: Date;
}

export interface IContato extends Document {
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
  lido: boolean;
  respondido: boolean;
  criadoEm: Date;
}

export interface IMembro extends Document {
  nome: string;
  cargo: string;
  descricao?: string;
  fotoUrl?: string;
  fotoPublicId?: string;
  email?: string;
  ordem: number;
  ativo: boolean;
  criadoEm: Date;
}

// ── Schemas ──

export const UsuarioSchema = new Schema<IUsuario>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  senhaHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
  ativo: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'criadoEm' } });

export const NoticiaSchema = new Schema<INoticia>({
  titulo: { type: String, required: true },
  subtitulo: String,
  conteudo: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  imagemUrl: String,
  imagemPublicId: String,
  categoria: { type: String, enum: ['noticias', 'eventos', 'projetos', 'comunicados'], default: 'noticias' },
  destaque: { type: Boolean, default: false },
  publicado: { type: Boolean, default: false },
  autor: String,
  tags: [String],
}, { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } });

export const ProjetoSchema = new Schema<IProjeto>({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  descricaoCompleta: String,
  imagemUrl: String,
  imagemPublicId: String,
  status: { type: String, enum: ['ativo', 'concluido', 'planejado'], default: 'ativo' },
  categoria: { type: String, enum: ['habitacao', 'educacao', 'saude', 'cultura', 'assistencia', 'outros'], default: 'outros' },
  beneficiados: Number,
  dataInicio: String,
  dataFim: String,
  destaque: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'criadoEm' } });

export const GaleriaSchema = new Schema<IGaleria>({
  titulo: { type: String, required: true },
  descricao: String,
  imagemUrl: { type: String, required: true },
  imagemPublicId: { type: String, required: true },
  categoria: { type: String, enum: ['eventos', 'projetos', 'comunidade', 'institucional'], default: 'eventos' },
  destaque: { type: Boolean, default: false },
  ordem: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'criadoEm' } });

export const DocumentoSchema = new Schema<IDocumento>({
  titulo: { type: String, required: true },
  descricao: String,
  categoria: { type: String, enum: ['estatuto', 'ata', 'relatorio', 'prestacao_contas', 'certificado', 'outros'], default: 'outros' },
  arquivoUrl: { type: String, required: true },
  arquivoPublicId: { type: String, required: true },
  nomeArquivo: String,
  tamanho: { type: Number, default: 0 },
  publico: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'criadoEm' } });

export const ContatoSchema = new Schema<IContato>({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  telefone: String,
  assunto: { type: String, required: true },
  mensagem: { type: String, required: true },
  lido: { type: Boolean, default: false },
  respondido: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'criadoEm' } });

export const MembroSchema = new Schema<IMembro>({
  nome: { type: String, required: true },
  cargo: { type: String, required: true },
  descricao: String,
  fotoUrl: String,
  fotoPublicId: String,
  email: String,
  ordem: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'criadoEm' } });

// ── Models ──

export const UsuarioModel   = mongoose.model<IUsuario>('Usuario', UsuarioSchema);
export const NoticiaModel   = mongoose.model<INoticia>('Noticia', NoticiaSchema);
export const ProjetoModel   = mongoose.model<IProjeto>('Projeto', ProjetoSchema);
export const GaleriaModel   = mongoose.model<IGaleria>('Galeria', GaleriaSchema);
export const DocumentoModel = mongoose.model<IDocumento>('Documento', DocumentoSchema);
export const ContatoModel   = mongoose.model<IContato>('Contato', ContatoSchema);
export const MembroModel    = mongoose.model<IMembro>('Membro', MembroSchema);