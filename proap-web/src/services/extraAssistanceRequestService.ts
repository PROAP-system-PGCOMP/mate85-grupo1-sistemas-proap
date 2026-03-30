import { AppDispatch } from '../store';
import api from '.';
import { updateExtraSolicitations } from '../store/slices/assistance-request-slice/assistanceRequestSlice';
import { ExtraRequest, ExtraRequestListResponse } from '../types';

export type ExtraRequestPropToSort =
  | keyof Omit<ExtraRequest, 'user'>
  | `user.${keyof ExtraRequest['user']}`;

export const getExtraAssistanceRequests =
  (
    sortBy?: ExtraRequestPropToSort,
    ascending?: boolean,
    page?: number,
    size?: number,
  ) =>
  (dispatch: AppDispatch) => {
    const defaultPropToFilter: ExtraRequestPropToSort = 'createdAt';

    let requestUrl =
      'extrarequest/list' +
      `?sortBy=${sortBy ?? defaultPropToFilter}` +
      `&ascending=${ascending ?? false}` +
      `&page=${page ?? 0}` +
      `&size=${size ?? 10}`;

    return api
      .get<ExtraRequestListResponse>(requestUrl)
      .then(({ data }) => dispatch(updateExtraSolicitations(data)));
  };

export const createExtraAssistanceRequest = (request: ExtraRequest) =>
  api.post('extrarequest/create', request);

export const updateExtraAssistanceRequest = (request: ExtraRequest) =>
  api.put('extrarequest/update', request);

export const getExtraAssistanceRequestById = (id: number) =>
  api.get<ExtraRequest>(`extrarequest/find/${id}`);

export const deleteExtraAssistanceRequest = (id: number) =>
  api.delete(`extrarequest/remove/${id}`);

export const reviewExtraAssistanceRequest = (request: ExtraRequest) =>
  api.put('extrarequest/extrareviewsolicitation', request);
