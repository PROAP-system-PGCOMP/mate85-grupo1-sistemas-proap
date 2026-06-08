export const generateApprovalText = (req: any): string => {
  if (!req) return '';

  const formatCurrency = (val: number = 0) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if ('itemSolicitado' in req) {
    const name = req.user?.name || '';
    const valor = formatCurrency(req.valorSolicitado || 0);
    const item = req.itemSolicitado || 'não especificado';
    
    let extraText = `O/A solicitante ${name} submeteu um pedido de Demanda Extra solicitando apoio financeiro no valor de ${valor} destinado a: ${item}.`;
    
    if (req.justificativa) {
      extraText += ` A justificativa apresentada para a demanda é: "${req.justificativa}".`;
    }

    if (req.solicitacaoAuxilioOutrasFontes && req.nomeAgenciaFomento) {
      extraText += ` Consta que há auxílio de outras fontes financiadoras através da agência ${req.nomeAgenciaFomento}.`;
    }

    extraText += ` Após verificação da documentação e justificativa enviadas pelo solicitante, a comissão Proap entende que a solicitação está de acordo com as normas vigentes e recomenda sua aprovação. Posto em apreciação, a solicitação foi aprovada por unanimidade. Este colegiado permite a execução do que foi aprovado.`;

    return extraText;
  }

  const isDocente = req.solicitanteDocente;
  const type = isDocente ? 'docente' : 'discente';
  const name = isDocente ? req.nomeDocente : req.nomeDiscente || req.user?.name || '';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    if (dateString.includes('/')) return dateString;
    if (dateString.includes('-')) {
      const parts = dateString.split('T')[0].split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const cotacao = req.cotacaoMoeda || 1;

  const apoiosSolicitados: string[] = [];

  if (req.valorInscricao > 0) {
    let inscricaoText = '';
    if (req.isDolar) {
      const valBRL = req.valorInscricao * cotacao;
      inscricaoText = `US$ ${req.valorInscricao.toLocaleString('en-US', { minimumFractionDigits: 2 })} = aproximadamente ${formatCurrency(valBRL)}`;
    } else {
      inscricaoText = formatCurrency(req.valorInscricao);
    }
    apoiosSolicitados.push(`apoio de inscrição (${inscricaoText})`);
  }

  if (req.quantidadeDiariasSolicitadas > 0) {
    let diariasText = '';
    if (req.isDolar) {
      const valBRLDiaria = (req.valorDiaria || 0) * cotacao;
      const totalBRLDiarias = valBRLDiaria * req.quantidadeDiariasSolicitadas;
      diariasText = `${req.quantidadeDiariasSolicitadas} x US$ ${(req.valorDiaria || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} = aproximadamente ${formatCurrency(totalBRLDiarias)}`;
    } else {
      const totalBRLDiarias = (req.valorDiaria || 0) * req.quantidadeDiariasSolicitadas;
      diariasText = `${req.quantidadeDiariasSolicitadas} x ${formatCurrency(req.valorDiaria)} = aproximadamente ${formatCurrency(totalBRLDiarias)}`;
    }
    apoiosSolicitados.push(`${req.quantidadeDiariasSolicitadas} diárias (${diariasText})`);
  }

  if (apoiosSolicitados.length === 0) {
    apoiosSolicitados.push('apoio financeiro');
  }

  const textoApoios = apoiosSolicitados.join(' e ');
  
  const textoQualis = req.qualis ? `, Qualis ${req.qualis}` : '';

  let text = `O/A ${type} ${name} solicita ${textoApoios} para apresentação de trabalho oral (título: ${req.tituloPublicacao}) no ${req.nomeEvento}${textoQualis}, a ser realizado em ${req.cidade}, ${req.pais}, no período de ${formatDate(req.dataInicio)} a ${formatDate(req.dataFim)}.`;

  if (isDocente && req.valorPassagem > 0) {
    const passagemBRL = req.isDolar ? req.valorPassagem * cotacao : req.valorPassagem;
    text += ` O valor aproximado da passagem aérea será aproximadamente ${formatCurrency(passagemBRL)}.`;
  }

  const totalBRL = req.isDolar ? (req.valorTotal || 0) * cotacao : (req.valorTotal || 0);

  text += ` O valor total do apoio à solicitação é de aproximadamente ${formatCurrency(totalBRL)}. Após verificação da documentação enviada pelo solicitante, a comissão Proap entende que a solicitação está de acordo com a resolução Proap vigente e recomenda sua aprovação. Posto em apreciação, a solicitação foi aprovada por unanimidade. Este colegiado permite a execução do que foi aprovado, ainda que os preços sofram variações cambiais.`;

  return text;
};