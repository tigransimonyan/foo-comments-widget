import React, { useState, useMemo } from 'react';
import axios, { AxiosInstance } from 'axios';
import { ClientJS } from 'clientjs';
import { getCookie } from 'react-use-cookie';
import { ErrorMessage, Close } from '../Comments/style';
import { FadeIn } from './style';

const RequestContext = React.createContext<
  | {
      instance: AxiosInstance;
    }
  | undefined
>(undefined);

export function useRequest() {
  const context = React.useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequest must be used within a RequestProvider');
  }
  return context;
}

type Props = {
  children: React.ReactNode;
};

export default function RequestProvider(props: Props) {
  const [error, setError] = useState('');

  const instance = useMemo(() => {
    const pageId = `${window.location.hostname}${window.location.pathname}`;
    const client = new ClientJS();
    const fingerprint = client.getFingerprint();
    const token = getCookie('token');

    return axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        fingerprint,
        token
      },
      transformRequest: [
        function (data) {
          return {
            ...data,
            pageId
          };
        },
        ...axios.defaults.transformRequest
      ],
      transformResponse: [
        function (data, _headers, status) {
          if (status !== 200) {
            setError(data || 'Something went wrong!');
          }
          return data;
        },
        ...axios.defaults.transformResponse
      ]
    });
  }, [axios]);

  return (
    <RequestContext.Provider value={{ instance }}>
      {error && (
        <ErrorMessage>
          {error} <Close onClick={() => setError('')} />
        </ErrorMessage>
      )}
      <FadeIn>{props.children}</FadeIn>
    </RequestContext.Provider>
  );
}
