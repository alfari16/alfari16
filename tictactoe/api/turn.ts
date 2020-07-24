import {NowRequest, NowResponse} from "@vercel/node/dist";

export default (req: NowRequest, res: NowResponse) => {
    res.json({hello: 'world'});
}