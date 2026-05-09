'use client'

import { use, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useApiClient } from '@/hooks/useApiClient'
import DashboardLayout from '@/components/DashboardLayout'
import { Loader2, ArrowLeft, Download } from 'lucide-react'
import jsPDF from 'jspdf'

// ---------------------------------------------------------------------------
// Types (mirrors the Kotlin NfseSnapshot hierarchy)
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SnapshotEndereco {
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  cep?: string
  codigoMunicipio?: string
}

interface SnapshotPessoa {
  nome?: string
  cpfCnpj?: string
  inscricaoMunicipal?: string
  telefone?: string
  email?: string
  endereco?: SnapshotEndereco
}

interface SnapshotIdentificacao {
  chaveAcesso?: string
  codigoAutorizacao?: string
  idDps?: string
  numeroNfse?: string
  numeroDps?: string
  serieDps?: string
  competencia?: string
  dataHoraEmissaoNfse?: string
  dataHoraEmissaoDps?: string
  ambiente?: string
}

interface SnapshotServico {
  codigoTributacaoNacional?: string
  descricaoCodigoTributacaoNacional?: string
  codigoTributacaoMunicipal?: string
  localPrestacao?: string
  codigoMunicipioPrestacao?: string
  paisPrestacao?: string
  descricaoServico?: string
  intermediarioIdentificado?: boolean
}

interface SnapshotRegimeTributario {
  simplesNacional?: boolean
  simplesNacionalDescricao?: string
  regimeApuracaoTributariaSnCodigo?: string
  regimeApuracaoTributariaSnDescricao?: string
  regimeEspecialTributacaoCodigo?: string
  regimeEspecialTributacaoDescricao?: string
  exigibilidadeIssCodigo?: string
  issRetidoCodigo?: string
  issRetidoDescricao?: string
}

interface SnapshotTributacaoMunicipal {
  tributacaoIssqnCodigo?: string
  tributacaoIssqnDescricao?: string
  paisResultadoPrestacao?: string
  municipioIncidencia?: string
  codigoMunicipioIncidencia?: string
  suspensaoExigibilidadeIssqn?: boolean
  numeroProcessoSuspensao?: string
  beneficioMunicipal?: string
  tipoImunidade?: string
  baseCalculoIssqn?: number | null
  aliquotaAplicada?: number | null
  issqnApurado?: number | null
}

interface SnapshotTributacaoFederal {
  irrf?: number | null
  contribuicaoPrevidenciariaRetida?: number | null
  contribuicoesSociaisRetidas?: number | null
  descricaoContribuicoesSociaisRetidas?: string
  pisDebitoApuracaoPropria?: number | null
  cofinsDebitoApuracaoPropria?: number | null
}

interface SnapshotValores {
  valorServico?: number
  descontoCondicionado?: number | null
  descontoIncondicionado?: number | null
  totalDeducoesReducoes?: number | null
  calculoBm?: number | null
  issqnRetido?: number | null
  totalRetencoesFederais?: number | null
  pisCofinsDebitoApuracaoPropria?: number | null
  valorLiquido?: number
  totaisAproximadosFederais?: number | null
  totaisAproximadosEstaduais?: number | null
  totaisAproximadosMunicipais?: number | null
}

interface NfseSnapshot {
  identificacao?: SnapshotIdentificacao
  emitente?: SnapshotPessoa
  tomador?: SnapshotPessoa
  servico?: SnapshotServico
  regimeTributario?: SnapshotRegimeTributario
  tributacaoMunicipal?: SnapshotTributacaoMunicipal
  tributacaoFederal?: SnapshotTributacaoFederal
  valores?: SnapshotValores
  informacoesComplementares?: string
}

interface NoteData {
  id: string
  chaveAcesso?: string
  codigoAutorizacao?: string
  numeroNota?: string
  ambiente?: string
  status?: string
  valorServico?: number
  valorLiquido?: number
  clientName?: string
  clientDocument?: string
  serviceDescription?: string
  createdAt?: string
  snapshot?: NfseSnapshot
  [key: string]: any
}

// ---------------------------------------------------------------------------
// Formatting helpers (match desktop NfsePdfGenerator exactly)
// ---------------------------------------------------------------------------

function formatCpfCnpj(value: string | undefined | null): string {
  if (!value) return ''
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11) {
    return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9)}`
  }
  if (digits.length === 14) {
    return `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8, 12)}-${digits.substring(12)}`
  }
  return value
}

function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, '')
  if (digits.length === 8) return `${digits.substring(0, 5)}-${digits.substring(5)}`
  return cep
}

function formatEnderecoCompleto(addr: SnapshotEndereco | undefined | null): string {
  if (!addr) return ''
  const parts: string[] = []
  if (addr.logradouro) {
    const a = addr.numero ? `${addr.logradouro} ${addr.numero}` : addr.logradouro
    parts.push(a)
  }
  if (addr.complemento) parts.push(addr.complemento)
  if (addr.bairro) parts.push(addr.bairro)
  if (addr.cep) parts.push(`CEP: ${formatCep(addr.cep)}`)
  return parts.join(' - ')
}

function formatDateTime(isoDate: string | undefined | null): string {
  if (!isoDate) return ''
  try {
    const datePart = isoDate.split('T')[0]
    let timePart = isoDate.split('T')[1] || ''
    // Remove timezone offset
    timePart = timePart.replace(/[-+]\d{2}:\d{2}$/, '').replace(/Z$/, '')
    const parts = datePart.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]} ${timePart}`
    }
    return isoDate
  } catch {
    return isoDate || ''
  }
}

function formatMoney(value: number | null | undefined): string {
  const v = value ?? 0
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatMoneyOrStar(value: number | null | undefined): string {
  if (value == null) return '*'
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatMoneyOrDash(value: number | null | undefined): string {
  if (value == null) return '-'
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatPercentOrStar(value: number | null | undefined): string {
  if (value == null) return '*'
  return `${value}%`
}

// ---------------------------------------------------------------------------
// PDF Generation Constants (match desktop: 40pt margin on 595.28 x 841.89 A4)
// PDFBox points → jsPDF mm: 1pt = 0.3528mm
// ---------------------------------------------------------------------------

// jsPDF A4 in mm: 210 x 297
const PAGE_W = 210
// const PAGE_H = 297  // A4 height (unused, kept for reference)
const MARGIN = 14.11 // 40pt
const CONTENT_W = PAGE_W - 2 * MARGIN // ~181.78mm

// Font sizes (pt → mm for jsPDF font size, jsPDF uses pt for setFontSize)
const FONT_SIZE_TITLE = 10
const FONT_SIZE_SECTION = 8
const FONT_SIZE_BODY = 7.5
const FONT_SIZE_SMALL = 6.5

// Convert pt measurements to mm for positioning
const PT_TO_MM = 0.3528
const LINE_HEIGHT = 12 * PT_TO_MM   // 4.23mm
const SECTION_GAP = 4 * PT_TO_MM    // 1.41mm

// ---------------------------------------------------------------------------
// PDF Generation
// ---------------------------------------------------------------------------

function generateNfsePdf(note: NoteData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setLineWidth(0.18) // ~0.5pt

  const snap = note.snapshot!
  const ident = snap.identificacao ?? {}
  const emitente = snap.emitente ?? {}
  const tomador = snap.tomador ?? {}
  const servico = snap.servico ?? {}
  const regime = snap.regimeTributario ?? {}
  const tribMun = snap.tributacaoMunicipal ?? {}
  const tribFed = snap.tributacaoFederal ?? {}
  const valores = snap.valores ?? {}

  let y = MARGIN // current y position (top-down)

  // ── Helper: draw text ──
  function drawText(
    text: string,
    x: number,
    yPos: number,
    style: 'bold' | 'normal',
    size: number
  ) {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    doc.text(text, x, yPos)
  }

  // ── Helper: draw rect (x, y is top-left in jsPDF mm) ──
  function drawRect(x: number, yTop: number, w: number, h: number) {
    doc.setLineWidth(0.18)
    doc.rect(x, yTop, w, h)
  }

  // ── Helper: draw line ──
  function drawLine(x1: number, y1: number, x2: number, y2: number) {
    doc.setLineWidth(0.18)
    doc.line(x1, y1, x2, y2)
  }

  // ── Helper: wrap text ──
  function wrapText(text: string, size: number, maxWidthMm: number): string[] {
    if (!text || text.trim() === '') return ['']
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    // Use jsPDF's splitTextToSize for accurate wrapping
    const lines: string[] = doc.splitTextToSize(text, maxWidthMm)
    return lines
  }

  // ── Helper: center text ──
  function drawCenteredText(
    text: string,
    yPos: number,
    style: 'bold' | 'normal',
    size: number
  ) {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    const textWidth = doc.getTextWidth(text)
    const x = MARGIN + (CONTENT_W - textWidth) / 2
    doc.text(text, x, yPos)
  }

  // ── Helper: draw section title (centered with separator line) ──
  function drawSectionTitle(title: string, boxTop: number) {
    // separator line at boxTop + 4.23mm (12pt)
    const lineY = boxTop + 12 * PT_TO_MM
    drawLine(MARGIN, lineY, MARGIN + CONTENT_W, lineY)
    // title text centered above the separator line
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(FONT_SIZE_SECTION)
    const tw = doc.getTextWidth(title)
    const cx = MARGIN + (CONTENT_W - tw) / 2
    // 8pt from top = 2.82mm → text baseline
    doc.text(title, cx, boxTop + 8 * PT_TO_MM)
  }

  // ====================================================================
  // 1. HEADER
  // ====================================================================
  {
    const boxH = 70 * PT_TO_MM // 24.70mm
    const rightColW = 160 * PT_TO_MM // 56.45mm
    const rightColX = MARGIN + CONTENT_W - rightColW

    drawRect(MARGIN, y, CONTENT_W, boxH)
    drawRect(rightColX, y, rightColW, boxH)

    // Left side: Municipality / Title
    const cidade = emitente.endereco?.cidade || 'Municipio'
    drawText(
      `PREFEITURA MUNICIPAL DE ${cidade.toUpperCase()}`,
      MARGIN + 8 * PT_TO_MM,
      y + 14 * PT_TO_MM,
      'bold',
      FONT_SIZE_SECTION
    )
    drawText(
      'NOTA FISCAL ELETRONICA DE SERVICOS - NFS-e',
      MARGIN + 8 * PT_TO_MM,
      y + 28 * PT_TO_MM,
      'bold',
      FONT_SIZE_TITLE
    )

    const ambiente = ident.ambiente === 'HOMOLOGACAO' ? ' (HOMOLOGACAO)' : ''
    drawText(
      `DPS N ${ident.numeroDps || ''} Serie ${ident.serieDps || ''}${ambiente}`,
      MARGIN + 8 * PT_TO_MM,
      y + 42 * PT_TO_MM,
      'normal',
      FONT_SIZE_SMALL
    )

    const chave = ident.chaveAcesso || note.chaveAcesso || ''
    if (chave) {
      drawText(chave, MARGIN + 8 * PT_TO_MM, y + 56 * PT_TO_MM, 'normal', FONT_SIZE_SMALL)
    }

    // Right column
    drawText('Número da Nota', rightColX + 6 * PT_TO_MM, y + 10 * PT_TO_MM, 'normal', FONT_SIZE_SMALL)
    drawText(
      (note.numeroNota || '').padStart(8, '0'),
      rightColX + 6 * PT_TO_MM,
      y + 20 * PT_TO_MM,
      'bold',
      FONT_SIZE_SECTION
    )

    drawText('Data e Hora de Emissao', rightColX + 6 * PT_TO_MM, y + 32 * PT_TO_MM, 'normal', FONT_SIZE_SMALL)
    drawText(
      formatDateTime(ident.dataHoraEmissaoNfse),
      rightColX + 6 * PT_TO_MM,
      y + 42 * PT_TO_MM,
      'bold',
      FONT_SIZE_BODY
    )

    drawText('Codigo de Verificacao', rightColX + 6 * PT_TO_MM, y + 54 * PT_TO_MM, 'normal', FONT_SIZE_SMALL)
    const codAut = (ident.codigoAutorizacao || note.codigoAutorizacao || '').slice(-12)
    drawText(codAut, rightColX + 6 * PT_TO_MM, y + 64 * PT_TO_MM, 'bold', FONT_SIZE_BODY)

    y += boxH + SECTION_GAP
  }

  // ====================================================================
  // 2. PRESTADOR DE SERVICOS
  // ====================================================================
  {
    const boxH = 63 * PT_TO_MM
    const boxTop = y
    drawRect(MARGIN, boxTop, CONTENT_W, boxH)
    drawSectionTitle('PRESTADOR DE SERVICOS', boxTop)

    let ty = boxTop + 17 * PT_TO_MM

    drawText(
      `CPF/CNPJ: ${formatCpfCnpj(emitente.cpfCnpj)}`,
      MARGIN + 8 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )
    drawText(
      `Inscricao Municipal: ${emitente.inscricaoMunicipal || '----'}`,
      MARGIN + CONTENT_W / 2,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )
    ty += LINE_HEIGHT

    drawText(
      `Nome/Razão Social: ${emitente.nome || ''}`,
      MARGIN + 8 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'bold',
      FONT_SIZE_BODY
    )
    ty += LINE_HEIGHT

    drawText(
      `Endereço: ${formatEnderecoCompleto(emitente.endereco)}`,
      MARGIN + 8 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )
    ty += LINE_HEIGHT

    drawText(
      `Municipio: ${emitente.endereco?.cidade || ''}`,
      MARGIN + 8 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )
    drawText(
      `UF: ${emitente.endereco?.uf || ''}`,
      MARGIN + CONTENT_W - 80 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )

    y = boxTop + boxH + SECTION_GAP
  }

  // ====================================================================
  // 3. TOMADOR DE SERVICOS
  // ====================================================================
  {
    const boxH = 75 * PT_TO_MM
    const boxTop = y
    drawRect(MARGIN, boxTop, CONTENT_W, boxH)
    drawSectionTitle('TOMADOR DE SERVICOS', boxTop)

    let ty = boxTop + 17 * PT_TO_MM

    drawText(
      `Nome/Razão Social: ${tomador.nome || ''}`,
      MARGIN + 8 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'bold',
      FONT_SIZE_BODY
    )
    ty += LINE_HEIGHT

    drawText(
      `CPF/CNPJ: ${formatCpfCnpj(tomador.cpfCnpj)}`,
      MARGIN + 8 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )
    drawText(
      `Inscricao Municipal: ${tomador.inscricaoMunicipal || '----'}`,
      MARGIN + CONTENT_W / 2,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )
    ty += LINE_HEIGHT

    drawText(
      `Endereço: ${formatEnderecoCompleto(tomador.endereco)}`,
      MARGIN + 8 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )
    ty += LINE_HEIGHT

    drawText(
      `Municipio: ${tomador.endereco?.cidade || ''}`,
      MARGIN + 8 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )
    drawText(
      `UF: ${tomador.endereco?.uf || ''}`,
      MARGIN + CONTENT_W / 2,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )
    drawText(
      `E-mail: ${tomador.email || '----'}`,
      MARGIN + CONTENT_W / 2 + 60 * PT_TO_MM,
      ty + 4 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )

    y = boxTop + boxH + SECTION_GAP
  }

  // ====================================================================
  // 4. DISCRIMINACAO DE SERVICOS
  // ====================================================================
  {
    const desc = servico.descricaoServico || ''
    const lines = wrapText(desc, FONT_SIZE_BODY, CONTENT_W - 16 * PT_TO_MM)
    const minLines = 6
    const actualLines = Math.max(lines.length, minLines)
    const boxH = 17 * PT_TO_MM + actualLines * LINE_HEIGHT + 8 * PT_TO_MM
    const boxTop = y

    drawRect(MARGIN, boxTop, CONTENT_W, boxH)
    drawSectionTitle('DISCRIMINACAO DE SERVICOS', boxTop)

    let ty = boxTop + 21 * PT_TO_MM
    for (const line of lines) {
      drawText(line, MARGIN + 8 * PT_TO_MM, ty, 'normal', FONT_SIZE_BODY)
      ty += LINE_HEIGHT
    }

    y = boxTop + boxH + SECTION_GAP
  }

  // ====================================================================
  // 5. VALOR TOTAL DO SERVICO
  // ====================================================================
  {
    const boxH = 18 * PT_TO_MM
    const boxTop = y

    drawRect(MARGIN, boxTop, CONTENT_W, boxH)

    const valorStr = `VALOR TOTAL DO SERVICO = R$ ${formatMoney(valores.valorServico)}`
    drawCenteredText(valorStr, boxTop + 13 * PT_TO_MM, 'bold', FONT_SIZE_TITLE)

    y = boxTop + boxH // no SECTION_GAP after valor total (desktop: startY - boxH)
  }

  // ====================================================================
  // 6. IMPOSTOS FEDERAIS
  // ====================================================================
  {
    const boxH = 28 * PT_TO_MM
    const boxTop = y

    drawRect(MARGIN, boxTop, CONTENT_W, boxH)

    const colW = CONTENT_W / 6
    const labels = ['INSS (R$)', 'IRRF (R$)', 'CSLL (R$)', 'COFINS (R$)', 'PIS/PASEP (R$)', 'IPI (R$)']
    const vals = [
      tribFed.contribuicaoPrevidenciariaRetida,
      tribFed.irrf,
      tribFed.contribuicoesSociaisRetidas,
      tribFed.cofinsDebitoApuracaoPropria ?? null,
      tribFed.pisDebitoApuracaoPropria,
      null
    ]

    for (let i = 0; i < labels.length; i++) {
      const x = MARGIN + i * colW + 4 * PT_TO_MM
      drawText(labels[i], x, boxTop + 10 * PT_TO_MM, 'normal', FONT_SIZE_SMALL)
      drawText(formatMoney(vals[i]), x, boxTop + 22 * PT_TO_MM, 'normal', FONT_SIZE_BODY)
      if (i > 0) {
        drawLine(MARGIN + i * colW, boxTop, MARGIN + i * colW, boxTop + boxH)
      }
    }

    y = boxTop + boxH // no SECTION_GAP
  }

  // ====================================================================
  // 7. CODIGO DO SERVICO
  // ====================================================================
  {
    const boxH = 24 * PT_TO_MM
    const boxTop = y

    drawRect(MARGIN, boxTop, CONTENT_W, boxH)

    drawText('Codigo do Serviço', MARGIN + 8 * PT_TO_MM, boxTop + 10 * PT_TO_MM, 'normal', FONT_SIZE_SMALL)
    const codTrib = servico.codigoTributacaoNacional || ''
    const descCod = servico.descricaoCodigoTributacaoNacional || ''
    const codText = descCod ? `${codTrib} - ${descCod}` : codTrib
    drawText(codText, MARGIN + 8 * PT_TO_MM, boxTop + 20 * PT_TO_MM, 'normal', FONT_SIZE_BODY)

    y = boxTop + boxH // no SECTION_GAP
  }

  // ====================================================================
  // 8. DEDUCOES / BASE / ALIQUOTA / ISS
  // ====================================================================
  {
    // Row 1: 5 columns
    const boxH = 28 * PT_TO_MM
    const boxTop = y

    drawRect(MARGIN, boxTop, CONTENT_W, boxH)

    const colW = CONTENT_W / 5
    const labels = [
      'Valor Total das Deducoes (R$)',
      'Base de Calculo (R$)',
      'Aliquota (%)',
      'Valor do ISS (R$)',
      'ISS Retido (R$)'
    ]
    const vals = [
      formatMoney(valores.totalDeducoesReducoes),
      formatMoneyOrStar(tribMun.baseCalculoIssqn),
      formatPercentOrStar(tribMun.aliquotaAplicada),
      formatMoneyOrStar(tribMun.issqnApurado),
      formatMoney(valores.issqnRetido)
    ]

    for (let i = 0; i < labels.length; i++) {
      const x = MARGIN + i * colW + 4 * PT_TO_MM
      drawText(labels[i], x, boxTop + 10 * PT_TO_MM, 'normal', FONT_SIZE_SMALL)
      drawText(vals[i], x, boxTop + 22 * PT_TO_MM, 'normal', FONT_SIZE_BODY)
      if (i > 0) {
        drawLine(MARGIN + i * colW, boxTop, MARGIN + i * colW, boxTop + boxH)
      }
    }

    // Row 2: municipality info (3 columns)
    const boxH2 = 24 * PT_TO_MM
    const y2 = boxTop + boxH
    drawRect(MARGIN, y2, CONTENT_W, boxH2)

    const col3W = CONTENT_W / 3

    drawText(
      'Municipio de Prestacao do Serviço',
      MARGIN + 8 * PT_TO_MM,
      y2 + 10 * PT_TO_MM,
      'normal',
      FONT_SIZE_SMALL
    )
    drawText(
      servico.localPrestacao || '-',
      MARGIN + 8 * PT_TO_MM,
      y2 + 20 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )

    drawLine(MARGIN + col3W, y2, MARGIN + col3W, y2 + boxH2)
    drawText(
      'Municipio de Incidencia',
      MARGIN + col3W + 4 * PT_TO_MM,
      y2 + 10 * PT_TO_MM,
      'normal',
      FONT_SIZE_SMALL
    )
    drawText(
      tribMun.municipioIncidencia || '-',
      MARGIN + col3W + 4 * PT_TO_MM,
      y2 + 20 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )

    drawLine(MARGIN + 2 * col3W, y2, MARGIN + 2 * col3W, y2 + boxH2)
    drawText(
      'Valor Aproximado dos Tributos',
      MARGIN + 2 * col3W + 4 * PT_TO_MM,
      y2 + 10 * PT_TO_MM,
      'normal',
      FONT_SIZE_SMALL
    )

    const aproxParts = [
      valores.totaisAproximadosFederais,
      valores.totaisAproximadosEstaduais,
      valores.totaisAproximadosMunicipais
    ].filter((v): v is number => v != null)
    const aproxTrib = aproxParts.length > 0 ? aproxParts.reduce((a, b) => a + b, 0) : null

    drawText(
      formatMoneyOrDash(aproxTrib),
      MARGIN + 2 * col3W + 4 * PT_TO_MM,
      y2 + 20 * PT_TO_MM,
      'normal',
      FONT_SIZE_BODY
    )

    y = y2 + boxH2 + SECTION_GAP
  }

  // ====================================================================
  // 9. OUTRAS INFORMACOES
  // ====================================================================
  {
    const infoLines: string[] = []

    if (regime.simplesNacional) {
      infoLines.push('Documento emitido por ME ou EPP optante pelo Simples Nacional.')
    }
    if (regime.regimeApuracaoTributariaSnDescricao) {
      infoLines.push(regime.regimeApuracaoTributariaSnDescricao)
    }
    if (regime.issRetidoDescricao) {
      infoLines.push(`ISS: ${regime.issRetidoDescricao}`)
    }
    if (tribMun.tributacaoIssqnDescricao) {
      infoLines.push(`Tributacao ISSQN: ${tribMun.tributacaoIssqnDescricao}`)
    }
    if (snap.informacoesComplementares) {
      infoLines.push(snap.informacoesComplementares)
    }
    if (note.ambiente === 'HOMOLOGACAO') {
      infoLines.push('*** NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL ***')
    }

    const allText = infoLines.join('; ')
    const wrapped = wrapText(allText, FONT_SIZE_SMALL, CONTENT_W - 16 * PT_TO_MM)
    const lineH2 = (LINE_HEIGHT - 2 * PT_TO_MM) // (12-2)pt = 10pt in mm
    const boxH = 17 * PT_TO_MM + Math.max(wrapped.length, 2) * lineH2 + 4 * PT_TO_MM
    const boxTop = y

    drawRect(MARGIN, boxTop, CONTENT_W, boxH)
    drawSectionTitle('OUTRAS INFORMACOES', boxTop)

    let ty = boxTop + 21 * PT_TO_MM
    for (const line of wrapped) {
      drawText(line, MARGIN + 8 * PT_TO_MM, ty, 'normal', FONT_SIZE_SMALL)
      ty += lineH2
    }

    // y = boxTop + boxH + SECTION_GAP (not needed, last section)
  }

  return doc
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { apiFetch } = useApiClient()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pdfUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadAndGenerate() {
      try {
        setLoading(true)
        setError(null)

        // Fetch note data
        const res = await apiFetch(`/api/notes?id=${id}`)
        if (!res.ok) {
          throw new Error('Falha ao carregar nota')
        }
        const rawData = await res.json()

        // Normalize: API may return various shapes
        let note: NoteData | null = null
        if (rawData?.id) {
          note = rawData
        } else if (Array.isArray(rawData?.notes) && rawData.notes.length > 0) {
          note = rawData.notes.find((n: any) => n.id === id) || rawData.notes[0]
        } else if (Array.isArray(rawData?.data)) {
          note = rawData.data[0] ?? null
        } else if (rawData?.data?.id) {
          note = rawData.data
        } else if (Array.isArray(rawData) && rawData.length > 0) {
          note = rawData[0]
        } else {
          note = rawData
        }

        if (!note) {
          throw new Error('Nota não encontrada')
        }

        if (!note.snapshot) {
          throw new Error(
            'Dados detalhados (snapshot) não disponíveis para está nota. O PDF não pode ser gerado.'
          )
        }

        if (cancelled) return

        // Generate PDF
        const doc = generateNfsePdf(note)
        const blob = doc.output('blob')
        const url = URL.createObjectURL(blob)

        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }

        pdfUrlRef.current = url
        setPdfUrl(url)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Erro ao gerar PDF')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAndGenerate()

    return () => {
      cancelled = true
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current)
        pdfUrlRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col">
        {/* Action bar */}
        <div className="p-4 border-b bg-white flex items-center justify-between shrink-0">
          <Link
            href="/notas-emitidas"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#7C3AED] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex gap-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                download={`NFSe_${id}.pdf`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
          </div>
        </div>

        {/* Content area */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-[#7C3AED] mb-4" />
            <p className="text-sm text-gray-500">Gerando PDF...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
            <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="font-medium text-red-700">Erro ao gerar o PDF</p>
              <p className="text-sm text-red-500 mt-2">{error}</p>
              <Link
                href="/notas-emitidas"
                className="inline-block mt-4 text-sm text-[#7C3AED] hover:underline"
              >
                Voltar para lista de notas
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && pdfUrl && (
          <iframe
            src={pdfUrl}
            className="flex-1 w-full border-0"
            title={`NFSe ${id}`}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
