import { useFormikContext } from 'formik';
import { SolicitationFormValues } from '../../containers/solicitation/SolicitationFormSchema';
import { useEffect } from 'react';

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Calcula o valor total da solicitação, sempre em BRL.
 *
 * Quando `isDolar` é verdadeiro, a inscrição e as diárias são informadas em USD
 * e convertidas pela `cotacaoMoeda`. A passagem aérea é sempre informada em BRL.
 */
const useCalculeTotal = () => {
  const { values, setFieldValue } = useFormikContext<SolicitationFormValues>();

  useEffect(() => {
    const quantidadeDiarias = toNumber(values.quantidadeDiariasSolicitadas);
    let fatorQuantidadeDiarias = quantidadeDiarias;
    if (quantidadeDiarias > 1 && !values.ultimaDiariaIntegral) {
      fatorQuantidadeDiarias -= 0.5;
    }

    const cotacao = values.isDolar ? toNumber(values.cotacaoMoeda) : 1;

    const valorInscricaoBRL = toNumber(values.valorInscricao) * cotacao;
    const valorDiariasBRL =
      toNumber(values.valorDiaria) * cotacao * fatorQuantidadeDiarias;
    const valorPassagemBRL = toNumber(values.valorPassagem);

    const valorTotal = valorInscricaoBRL + valorDiariasBRL + valorPassagemBRL;

    setFieldValue('valorTotal', Number(valorTotal.toFixed(2)));
  }, [
    values.valorInscricao,
    values.valorDiaria,
    values.valorPassagem,
    values.isDolar,
    values.cotacaoMoeda,
    values.quantidadeDiariasSolicitadas,
    values.ultimaDiariaIntegral,
  ]);
};
export default useCalculeTotal;
