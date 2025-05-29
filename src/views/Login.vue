<template>
  <!-- Show Lottie Loader only after authentication -->
  <LottieLoader v-if="loading" type="login" />

  <div
    v-else
    class="min-h-screen flex justify-center items-center bg-cover bg-center bg-no-repeat custom-bg"
  >
    <!-- Centered Login Form with Wider Glassmorphism -->
    <div class="glass-card rounded-2xl px-12 py-32 shadow-xl w-full max-w-2xl">
      <h2 class="text-white text-3xl font-semibold text-center mb-8">
        Website Diagnostic Login
      </h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <input
            type="email"
            v-model="email"
            placeholder="username@proweaver.email"
            class="input-style"
            required
          />
        </div>
        <div class="relative">
          <input
            :type="showPassword === 'password' ? 'text' : 'password'"
            v-model="password"
            placeholder="Password"
            class="input-style"
            required
          />
          <button
            type="button"
            class="absolute inset-y-0 right-4 flex items-center text-gray-300"
            @click="showPasswordtoggle"
            v-if="showPassword === 'text'"
          >
            <i class="fas fa-eye-slash"></i>
          </button>
          <button
            type="button"
            class="absolute inset-y-0 right-4 flex items-center text-gray-300"
            @click="hidePasswordtoggle"
            v-if="showPassword === 'password'"
          >
            <i class="fas fa-eye"></i>
          </button>
        </div>
        <button
          type="submit"
          class="w-full bg-[#0b254e] hover:bg-[#15396b] text-white py-3 rounded-lg transition duration-300"
          :disabled="authenticating"
        >
          <span v-if="!authenticating">Sign in</span>
          <span v-else>Logging in...</span>
        </button>
        <div v-if="error" class="text-red-300 text-sm mt-2">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { login } from "../services/api.js";
import LottieLoader from "../components/loader/LottieLoader.vue";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      showPassword: "text",
      authenticating: false,
      loading: false,
      error: null,
    };
  },
  components: {
    // BreedingRhombusSpinner,
    LottieLoader,
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    showPasswordtoggle() {
      this.showPassword = "password";
    },
    hidePasswordtoggle() {
      this.showPassword = "text";
    },
    async handleLogin() {
      if (!this.email || !this.password) {
        alert("Email and Password are required.");
        return;
      }

      this.authenticating = true;
      this.error = null;

      try {
        const response = await login({
          email: this.email,
          password: this.password,
        });

        const user = response.data.user || response.data.data?.data;
        if (!user) {
          throw new Error("User data missing in response");
        }

        // Save user info
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user_id", user.id);
        localStorage.setItem("identifier", this.identifier);

        // Show loader after successful auth
        this.loading = true;

        // Redirect after brief animation
        setTimeout(() => {
          this.router.push("/dashboard");
        }, 5000);
      } catch (error) {
        console.error(
          "Login error:",
          error.response?.data?.message || error.message
        );
        this.error = error.response?.data?.message || "An error occurred.";
      } finally {
        this.authenticating = false;
      }
    },
  },
};
</script>

<style scoped>
.custom-bg {
  background-image: url("@/assets/WebDiag-login-bg.png"); /* example path */
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
/* Additional styles */
.absolute {
  position: absolute;
}
.relative {
  position: relative;
}
.login-ui {
  width: 75%;
  background: white;
  height: 753px;
  justify-content: center;
  display: flex;
  align-items: center;
}
.rounded-lg {
  border-radius: 20px;
}
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.input-style {
  width: 100%;
  padding: 16px 18px;
  border: none;
  border-radius: 8px;
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.input-style::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}
</style>
