import axios from "axios";
import { Boom } from "@hapi/boom";

const GetWeb = async function GetWeb(URL: string, opts: object={}) {
    let result;
    try {
        result = await axios({
            url: URL,
            ...opts
        });
    } catch (error) {
        result = (error as Boom);
    } finally {
        return result.data;
    };
};

export {
    GetWeb
};