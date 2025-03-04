import qs from "querystring";

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

interface removeUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const queryString = qs.parse(params);
  queryString[key] = value;

  return qs.encode({
    query: queryString[key],
  });
};

export const removeKeysFormQuery = ({
  params,
  keysToRemove,
}: removeUrlQueryParams) => {
  const queryString = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete queryString[key];
  });

  return qs.stringify(
    {
      url: window.location.pathname,
      query: queryString,
    },
    { skipNull: true }
  );
};
