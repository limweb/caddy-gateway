import Keycloak from "keycloak-js";
import { ref } from "vue";

const keycloakConfig = {
  url: `https://${import.meta.env.VITE_SSO_AUTH_SERVER || "sso.shopsthai.com"}`,
  realm: import.meta.env.VITE_SSO_REALM || "shopsthai.app",
  clientId: import.meta.env.VITE_SSO_CLIENTID || "shopsthai-web1",
};

console.log("Keycloak Config:", keycloakConfig);

export const keycloakInstance = new Keycloak(keycloakConfig);
export const isAuthenticated = ref(false);

export const initKeycloak = async () => {
  try {
    console.log("Starting Keycloak init...");
    const authenticated = await keycloakInstance.init({
      onLoad: "login-required",
      checkLoginIframe: false,
      flow: "standard",
      enableLogging: true,
    });
    console.log("Keycloak init success, authenticated:", authenticated);
    isAuthenticated.value = authenticated;

    if (authenticated) {
      console.log("Token:", keycloakInstance.token?.substring(0, 20) + "...");
      setInterval(() => {
        keycloakInstance.updateToken(70).catch((err) => {
          console.error("Failed to refresh token:", err);
        });
      }, 60000);
    }
  } catch (error: any) {
    console.error("Keycloak init failed:", error);
    console.error("Error details:", error?.message || "No message");
    console.error("Error stack:", error?.stack || "No stack");
    throw error;
  }
};

export const login = () => {
  keycloakInstance.login();
};

export const logout = () => {
  keycloakInstance.logout({ redirectUri: window.location.origin });
};
