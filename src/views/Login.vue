<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div
      class="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-lg transition-all duration-500"
      :class="{ 'max-w-3xl': loading }"
    >
      <div
        class="flex flex-col md:flex-row transition-all duration-500"
        :class="{ 'md:flex-row md:w-full': loading }"
      >
        <!-- Left: Login Form -->
        <div
          class="w-full p-8 flex flex-col justify-center transition-all duration-500"
          :class="{ 'md:w1-full': loading }"
        >
          <h2 class="text-3xl font-semibold text-center mb-6">
            Website Diagnostic Tool
          </h2>
          <p class="text-gray-600 text-center mb-6">
            Login to access your website analysis dashboard
          </p>
          <form @submit.prevent="handleLogin">
            <div class="mb-4">
              <label class="block text-gray-700">Email or Username</label>
              <input
                v-model="email"
                type="text"
                class="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div class="mb-4 relative">
              <label class="block text-gray-700">Password</label>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                required
              />
              <button
                type="button"
                @click="togglePassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                <i
                  :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                ></i>
              </button>
            </div>
            <div class="flex justify-between items-center mb-4">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  class="form-checkbox text-blue-600 h-4 w-4"
                />
                <span class="ml-2 text-gray-700">Remember me</span>
              </label>
              <a href="#" class="text-blue-500 text-sm hover:underline"
                >Forgot password?</a
              >
            </div>
            <button
              type="submit"
              class="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition duration-300"
              :disabled="loading"
            >
              <span v-if="!loading">Log in</span>
              <span v-else>
                <div class="flex items-center justify-center">
                  <div class="loader mr-2"></div>
                  Logging in...
                </div>
              </span>
            </button>
            <div v-if="error" class="text-red-500 text-sm mt-4">
              {{ error }}
            </div>
          </form>
          <p class="mt-6 text-sm text-center">
            Don't have an account?
            <a href="/register" class="text-blue-500 hover:underline"
              >Sign Up</a
            >
          </p>
        </div>

        <!-- Right: Animated Loading Insights (Expands beside login form) -->
        <transition name="slide-expand">
          <div
            v-if="loading"
            class="w-3/4 bg-blue-50 p-8 flex flex-col justify-center items-center text-center shadow-lg transition-all duration-500"
          >
            <h3 class="text-lg font-semibold mb-4">
              Analyzing Website Data...
            </h3>
            <p class="text-gray-600">{{ loadingInsight }}</p>
            <div class="progress-bar mt-4">
              <div class="progress" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { login } from "../services/api.js";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      loading: false,
      error: null,
      progress: 0,
      loadingInsight: "Initializing...",
      insights: [
        "Checking server response time...",
        "Verifying SSL security...",
        "Analyzing website load performance...",
        "Scanning SEO metrics...",
        "Optimizing user experience...",
      ],
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      if (!this.email || !this.password) {
        alert("Email and Password are required.");
        return;
      }
      this.loading = true;
      this.error = null;
      this.startLoadingAnimation();
      try {
        const response = await login({
          email: this.email,
          password: this.password,
        });
        const user = response.data.user || response.data.data?.data;
        if (!user) {
          throw new Error("User data missing in response");
        }
        setTimeout(() => {
          sessionStorage.setItem("token", response.data.token);
          sessionStorage.setItem("user_id", user.id);
          this.router.push("/dashboard");
        }, 3000);
      } catch (error) {
        this.error = error.response?.data?.message || "An error occurred.";
        this.loading = false;
      }
    },
    startLoadingAnimation() {
      let index = 0;
      this.progress = 0;
      const interval = setInterval(() => {
        if (this.progress >= 100) {
          clearInterval(interval);
        } else {
          this.progress += 20;
          this.loadingInsight = this.insights[index % this.insights.length];
          index++;
        }
      }, 500);
    },
  },
};
</script>

<style scoped>
.bg-gray-100 {
  background-color: #f4f4f9;
}
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.progress-bar {
  width: 80%;
  height: 10px;
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
}
.progress {
  height: 100%;
  background: #3498db;
  transition: width 0.5s ease;
}
</style>
