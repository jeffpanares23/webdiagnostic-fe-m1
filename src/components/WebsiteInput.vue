<template>
  <div class="mx-auto my-8 text-center border-0">
    <!-- Header Text -->
    <div v-if="!hasScanned">
      <h1 class="text-4xl font-medium text-gray-900 mb-8">Run Diagnostic</h1>
      <p class="text-gray-700 text-base">
        Start diagnosing a website by entering a URL.
      </p>
      <p class="text-gray-400 mb-6 text-base">Try: https://example.com</p>
    </div>
    <!-- Input + Button -->
    <form
      @submit.prevent="handleButtonClick"
      class="flex flex-col sm:flex-row items-center gap-4 justify-center"
    >
      <input
        v-model="websiteUrl"
        type="url"
        class="w-full sm:w-[400px] max-w-4xl md:w-3/5 px-5 py-4 text-gray-700 placeholder-gray-400 rounded-xl border border-[#3B81F6] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
        placeholder="Enter URL or paste text here"
        :disabled="loading || hasScanned"
        required
      />
      <button
        type="button"
        @click="handleButtonClick"
        :class="[
          'flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white transition font-semibold',
          loading || !isValidUrl(websiteUrl.trim())
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700',
        ]"
        :disabled="loading || !isValidUrl(websiteUrl.trim())"
      >
        <svg
          v-if="loading"
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span v-else>
          {{ hasScanned ? "Diagnose Another Website" : "Diagnose" }}
        </span>
      </button>
    </form>

    <!-- Error Message -->
    <p v-if="errorMessage" class="text-red-500 mt-3 text-sm">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script>
import axios from "axios";
import baseUrl from "../config";

export default {
  name: "WebsiteInput",
  props: {
    modelValue: String,
    hasScanned: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "loading", "results", "reset", "error"],

  data() {
    return {
      errorMessage: "",
      loading: false,
    };
  },

  computed: {
    websiteUrl: {
      get() {
        return this.modelValue || "";
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },

  methods: {
    isValidUrl(value) {
      const pattern = new RegExp(
        "^(https?:\\/\\/)?" +
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})" +
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
          "(\\?[;&a-z\\d%_.~+=-]*)?" +
          "(\\#[-a-z\\d_]*)?$",
        "i"
      );
      return !!pattern.test(value);
    },

    handleButtonClick() {
      if (this.hasScanned && !this.loading) {
        this.errorMessage = "";
        this.$emit("error", "");
        this.$emit("reset");
        return;
      }
      this.submitUrl();
    },

    async submitUrl() {
      this.errorMessage = "";
      this.loading = true;
      this.$emit("loading");

      const formattedUrl = this.websiteUrl.trim();
      if (!this.isValidUrl(formattedUrl)) {
        this.errorMessage = "Invalid URL format. Please enter a valid URL.";
        this.loading = false;
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        this.errorMessage = "You are not authenticated. Please log in.";
        this.loading = false;
        return;
      }

      try {
        // Step 1: Send URL to backend to start queued job
        const startRes = await axios.post(
          `${baseUrl}/api/analyze-website`,
          { url: formattedUrl },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const jobId = startRes.data.job_id;
        if (!jobId) throw new Error("No job ID returned.");

        // Step 2: Start polling scan status
        this.pollScanStatus(jobId);
      } catch (err) {
        this.errorMessage =
          err.response?.data?.error || "Error initiating scan.";
        this.$emit("error", this.errorMessage);
        this.loading = false;
      }
    },

    pollScanStatus(jobId) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${baseUrl}/api/scan-status/${jobId}`
          );
          const result = response.data;

          if (result.status === "done") {
            clearInterval(interval);
            this.$emit("results", result.data);
            this.loading = false;
          } else if (result.status === "error") {
            clearInterval(interval);
            this.errorMessage = result.message || "Scan failed.";
            this.$emit("error", this.errorMessage);
            this.loading = false;
          }
          // else: still processing — keep polling
        } catch (error) {
          clearInterval(interval);
          this.errorMessage =
            error.response?.data?.error || "Error polling scan result.";
          this.$emit("error", this.errorMessage);
          this.loading = false;
        }
      }, 3000); // ⏱ Poll every 3 seconds
    },
  },
};
</script>
