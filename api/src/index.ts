import { Elysia } from "elysia";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { cors } from "@elysiajs/cors";

const SSO_SERVER = process.env.SSO_AUTH_SERVER || "sso.shopsthai.com";
const SSO_REALM = process.env.SSO_REALM || "shopsthai.app";
const API_PORT = parseInt(process.env.API_PORT || "3000");

const JWKS_URI = `https://${SSO_SERVER}/realms/${SSO_REALM}/protocol/openid-connect/certs`;
const ISSUER = `https://${SSO_SERVER}/realms/${SSO_REALM}`;

const jwks = createRemoteJWKSet(new URL(JWKS_URI));

const app = new Elysia()
  .use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .onBeforeHandle(async ({ request, set }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Missing or invalid Authorization header" };
    }

    const token = authHeader.substring(7);
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: ISSUER,
        audience: "account",
      });
      (request as any).user = payload;
    } catch (err) {
      set.status = 401;
      return { error: "Invalid token" };
    }
  })
  .get("/me", ({ request }) => {
    const user = (request as any).user;
    const headers = request.headers;

    return {
      // ข้อมูลจาก JWT token
      jwt: {
        sub: user.sub,
        email: user.email,
        name: user.name,
        preferred_username: user.preferred_username,
      },
      // ข้อมูลจาก headers ที่ Caddy ส่งมา (สำหรับ debug)
      headers: {
        "X-User-Sub": headers.get("X-User-Sub"),
        "X-User-Email": headers.get("X-User-Email"),
        "X-User-Roles": headers.get("X-User-Roles"),
        "X-User-Name": headers.get("X-User-Name"),
        "X-User-Preferred-Username": headers.get("X-User-Preferred-Username"),
        "X-User-Given-Name": headers.get("X-User-Given-Name"),
        "X-User-Family-Name": headers.get("X-User-Family-Name"),
        "X-User-Email-Verified": headers.get("X-User-Email-Verified"),
        Authorization: headers.get("Authorization"),
        Host: headers.get("Host"),
      },
    };
  })
  .get("/datas", () => {
    return {
      datas: [
        { id: 1, name: "Data 1", value: 100 },
        { id: 2, name: "Data 2", value: 200 },
        { id: 3, name: "Data 3", value: 300 },
      ],
    };
  })
  .get("/health", () => ({ status: "ok" }))
  .listen(API_PORT);

console.log(`API server running at http://localhost:${API_PORT}`);
