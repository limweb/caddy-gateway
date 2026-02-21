import Keycloak from "keycloak-js";
import { ref } from "vue";

const keycloakConfig = {
  url: `https://${import.meta.env.VITE_SSO_AUTH_SERVER || "sso.shopsthai.com"}`,
  realm: import.meta.env.VITE_SSO_REALM || "shopsthai.app",
  clientId: import.meta.env.VITE_SSO_CLIENTID || "shopsthai-web2",
};

export const keycloakInstance = new Keycloak(keycloakConfig);
export const isAuthenticated = ref(false);

export const initKeycloak = async () => {
  try {
    const authenticated = await keycloakInstance.init({
      onLoad: "login-required",
      checkLoginIframe: false,
    });
    isAuthenticated.value = authenticated;

    // Token refresh
    if (authenticated) {
      setInterval(() => {
        keycloakInstance.updateToken(70).catch(() => {
          console.error("Failed to refresh token");
        });
      }, 60000);
    }
  } catch (error) {
    console.error("Keycloak init failed:", error);
  }
};

export const login = () => {
  keycloakInstance.login();
};

export const logout = () => {
  keycloakInstance.logout({ redirectUri: window.location.origin });
};
