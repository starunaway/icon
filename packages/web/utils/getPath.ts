const EP_LOGIN = process.env.NEXT_PUBLIC_EP_LOGIN;

const REDIRECT = process.env.NEXT_PUBLIC_REDIRECT;

export const getRedirectUrl = () => {
  return `${EP_LOGIN}?redirect=${REDIRECT}`;
};
