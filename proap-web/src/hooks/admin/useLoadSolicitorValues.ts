import { useCallback, useState } from 'react';
import { getSolicitorAccumulatedValues, SolicitorAccumulatedValueDTO } from '../../services/budgetService';

export default function useLoadSolicitorValues() {
  const [data, setData] = useState<SolicitorAccumulatedValueDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    getSolicitorAccumulatedValues()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, fetchData };
}
