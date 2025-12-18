import axios, { type AxiosRequestHeaders } from "axios";

type QueryParams = Record<string, any>;

interface RequestOptions {
	headers?: AxiosRequestHeaders;
	data?: any;
	params?: QueryParams;
}

const request = async (
	endpoint: string,
	method: string,
	headers?: any,
	data?: any,
	params?: any,
): Promise<any> => {
	return await axios({ method, url: endpoint, headers, data, params });
};

export const post = async (endpoint: string, options?: RequestOptions): Promise<any> => {
	const resp = await request(endpoint, "POST", options?.headers, options?.data, options?.params);
	return resp.data;
};
