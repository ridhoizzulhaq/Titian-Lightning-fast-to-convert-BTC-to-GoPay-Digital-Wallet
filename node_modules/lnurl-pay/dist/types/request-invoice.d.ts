import type { LnUrlRequestInvoiceArgs, LnUrlRequestInvoiceResponse, LnUrlrequestInvoiceWithServiceParamsArgs } from './types';
export declare const requestInvoiceWithServiceParams: ({ params, tokens, comment, onionAllowed, fetchGet, }: LnUrlrequestInvoiceWithServiceParamsArgs) => Promise<LnUrlRequestInvoiceResponse>;
export declare const requestInvoice: ({ lnUrlOrAddress, tokens, comment, onionAllowed, fetchGet, }: LnUrlRequestInvoiceArgs) => Promise<LnUrlRequestInvoiceResponse>;
