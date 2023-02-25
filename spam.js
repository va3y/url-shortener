import { inspect } from "util"


const res=  await Promise.all(Array(100).fill(null).map(() => fetch("https://url-shortener-valerih12-va3y.vercel.app/api/trpc/example.setLink?batch=1", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "Referer": "https://url-shortener-valerih12-va3y.vercel.app/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": "{\"0\":{\"link\":\"https://url-shortener-valerih12-va3y.vercel.app/\"}}",
  "method": "POST"
})))




console.log(inspect(await Promise.all(res.map(re => re.json())), {depth: 4}))