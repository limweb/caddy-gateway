<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  initKeycloak,
  isAuthenticated,
  keycloakInstance,
  login,
  logout,
} from "./keycloak";

const API_URL = import.meta.env.VITE_API_URL || "https://api.shopsthai.com";

const userProfile = ref<any>(null);
const apiData = ref<any>(null);
const loading = ref(false);
const error = ref("");

onMounted(async () => {
  await initKeycloak();
  console.log("Auth status:", isAuthenticated.value);
  console.log("Token exists:", !!keycloakInstance.token);
  if (isAuthenticated.value) {
    await loadData();
  }
});

const loadData = async () => {
  loading.value = true;
  error.value = "";
  try {
    const token = keycloakInstance.token;
    console.log("API_URL:", API_URL);
    console.log(
      "Token preview:",
      token ? token.substring(0, 20) + "..." : "NO TOKEN",
    );

    // Load user profile
    const profileRes = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Profile response status:", profileRes.status);
    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error("Profile error:", errText);
      throw new Error(`Failed to load profile: ${profileRes.status}`);
    }
    userProfile.value = await profileRes.json();

    // Load datas
    const dataRes = await fetch(`${API_URL}/datas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!dataRes.ok) throw new Error("Failed to load data");
    apiData.value = await dataRes.json();
  } catch (err: any) {
    error.value = err.message;
    console.error("loadData error:", err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container">
    <h1>Web1 - Shopsthai</h1>

    <div v-if="!isAuthenticated" class="login-section">
      <p>กรุณาเข้าสู่ระบบ</p>
      <button @click="login">Login with Keycloak</button>
    </div>

    <div v-else class="content">
      <div class="header">
        <span>Welcome!</span>
        <button @click="logout">Logout</button>
      </div>

      <div v-if="loading" class="loading">Loading...</div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else class="data-section">
        <div class="profile" v-if="userProfile">
          <h2>Profile</h2>
          <pre>{{ JSON.stringify(userProfile, null, 2) }}</pre>
        </div>

        <div class="datas" v-if="apiData">
          <h2>Data from API</h2>
          <pre>{{ JSON.stringify(apiData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.login-section {
  text-align: center;
  padding: 40px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

.loading {
  text-align: center;
  padding: 40px;
}

.error {
  color: red;
  padding: 20px;
}

.data-section {
  display: grid;
  gap: 20px;
}

.profile,
.datas {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

pre {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
